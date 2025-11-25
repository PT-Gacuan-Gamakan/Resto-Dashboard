import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { MQTTService } from '../mqtt/mqtt.service';

export function createRouter(dbService: DatabaseService, mqttService: MQTTService): Router {
  const router = Router();

  // Get current dashboard data
  router.get('/api/dashboard', async (req: Request, res: Response) => {
    try {
      const data = await dbService.getCurrentStatus();
      res.json(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Get today's hourly statistics
  router.get('/api/stats/hourly', async (req: Request, res: Response) => {
    try {
      const stats = await dbService.getTodayHourlyStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching hourly stats:', error);
      res.status(500).json({ error: 'Failed to fetch hourly stats' });
    }
  });

  // Get recent visitor events
  router.get('/api/events/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const events = await dbService.getRecentEvents(limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching recent events:', error);
      res.status(500).json({ error: 'Failed to fetch recent events' });
    }
  });

  // Update max capacity
  router.post('/api/capacity', async (req: Request, res: Response) => {
    try {
      const { capacity } = req.body;

      if (!capacity || capacity < 1) {
        return res.status(400).json({ error: 'Invalid capacity value' });
      }

      await dbService.updateMaxCapacity(capacity);

      // Publish to MQTT so ESP32 receives the update
      mqttService.publishCapacity(capacity);

      res.json({ success: true, capacity });
    } catch (error) {
      console.error('Error updating capacity:', error);
      res.status(500).json({ error: 'Failed to update capacity' });
    }
  });

  // Toggle open/closed status
  router.post('/api/status/toggle', async (req: Request, res: Response) => {
    try {
      const { isOpen } = req.body;

      if (typeof isOpen !== 'boolean') {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      await dbService.toggleOpenStatus(isOpen);
      const data = await dbService.getCurrentStatus();

      res.json(data);
    } catch (error) {
      console.error('Error toggling status:', error);
      res.status(500).json({ error: 'Failed to toggle status' });
    }
  });

  // Health check
  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
