import mqtt, { MqttClient } from 'mqtt';
import { DatabaseService } from '../services/database.service';
import { RealtimeEvent } from '../types';
import { TimezoneUtil } from '../utils/timezone.util';

export class MQTTService {
  private client: MqttClient | null = null;
  private dbService: DatabaseService;
  private eventCallback?: (event: RealtimeEvent) => void;

  private broker: string;
  private port: number;
  private topicSensor: string;
  private topicCapacity: string;
  private lastMessageTime: number = Date.now();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
    this.broker = process.env.MQTT_BROKER || 'broker.hivemq.com';
    this.port = parseInt(process.env.MQTT_PORT || '1883');
    this.topicSensor = process.env.MQTT_TOPIC_SENSOR || 'gacoan-resto/sensor';
    this.topicCapacity = process.env.MQTT_TOPIC_CAPACITY || 'gacoan-resto/dashboard/capacity';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const brokerUrl = `mqtt://${this.broker}:${this.port}`;
        console.log(`[MQTT] Connecting to ${brokerUrl}...`);

        this.client = mqtt.connect(brokerUrl, {
          clientId: `resto-dashboard-${Math.random().toString(16).slice(2, 8)}`,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000
        });

        this.client.on('connect', () => {
          console.log('[MQTT] Connected to broker');
          this.subscribe();
          this.startHealthMonitoring();
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('[MQTT] Connection error:', error);
          reject(error);
        });

        this.client.on('message', this.handleMessage.bind(this));

        this.client.on('reconnect', () => {
          console.log('[MQTT] Reconnecting...');
        });

        this.client.on('offline', () => {
          console.log('[MQTT] Client offline');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private subscribe() {
    if (!this.client) return;

    this.client.subscribe(this.topicSensor, (err) => {
      if (err) {
        console.error('[MQTT] Subscription error:', err);
      } else {
        console.log(`[MQTT] Subscribed to ${this.topicSensor}`);
      }
    });
  }

  private async handleMessage(topic: string, payload: Buffer) {
    this.lastMessageTime = Date.now(); // Track message time for health monitoring
    const message = payload.toString().toLowerCase();
    console.log(`[MQTT] Received: ${topic} -> ${message}`);

    if (topic === this.topicSensor) {
      try {
        let type: 'entry' | 'exit';
        let delta: number;

        if (message === 'add') {
          type = 'entry';
          delta = 1;
        } else if (message === 'remove') {
          type = 'exit';
          delta = -1;
        } else {
          console.warn(`[MQTT] Unknown message: ${message}`);
          return;
        }

        // Log to database
        await this.dbService.logVisitor(type);

        // Update current count
        const currentVisitors = await this.dbService.updateCurrentVisitors(delta);

        // Update hourly stats with Jakarta timezone
        const now = TimezoneUtil.nowInJakarta();
        const jakartaHour = TimezoneUtil.getJakartaHour(now);
        await this.dbService.updateHourlyStats(now, jakartaHour, type, currentVisitors);

        // Emit event for real-time updates with Jakarta timestamp
        const event: RealtimeEvent = {
          id: Date.now().toString(),
          type,
          timestamp: TimezoneUtil.toISOStringJakarta(now),
          currentVisitors
        };

        if (this.eventCallback) {
          this.eventCallback(event);
        }

        console.log(`[MQTT] Processed ${type} event. Current visitors: ${currentVisitors}`);
      } catch (error) {
        console.error('[MQTT] Error processing message:', error);
      }
    }
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeSinceLastMessage > FIVE_MINUTES) {
        console.warn('[MQTT] No messages received in 5 minutes - connection may be stale');
      }
    }, 60000); // Check every minute
  }

  publishCapacity(capacity: number): void {
    if (!this.client || !this.client.connected) {
      console.error('[MQTT] Client not connected');
      return;
    }

    this.client.publish(this.topicCapacity, capacity.toString(), (err) => {
      if (err) {
        console.error('[MQTT] Publish error:', err);
      } else {
        console.log(`[MQTT] Published capacity: ${capacity} to ${this.topicCapacity}`);
      }
    });
  }

  onEvent(callback: (event: RealtimeEvent) => void) {
    this.eventCallback = callback;
  }

  disconnect() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.client) {
      this.client.end();
      console.log('[MQTT] Disconnected');
    }
  }
}
