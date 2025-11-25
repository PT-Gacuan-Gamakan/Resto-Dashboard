# 🍽️ Resto Dashboard - Real-time MQTT Visitor Monitoring

Dashboard monitoring pengunjung restoran secara real-time menggunakan MQTT, ESP32, dan sensor IR. Sistem ini menampilkan statistik pengunjung, kapasitas, dan analitik per jam dalam interface yang modern dengan dukungan dark/light mode.

## 📋 Fitur

### Dashboard Real-time
- **Current Visitor** - Jumlah pengunjung saat ini
- **Available Seats** - Kursi yang tersedia
- **Occupancy Rate** - Persentase hunian restoran
- **Status Indicator** - Status restoran (Buka/Penuh/Tutup)
- **Real-time Event Feed** - Live feed aktivitas masuk/keluar
- **Hourly Statistics** - Grafik statistik per jam hari ini
- **Peak Hours** - Informasi jam tersibuk
- **Capacity Control** - Kontrol kapasitas maksimal dengan publish ke ESP32

### UI/UX
- ✨ Modern & responsive design
- 🌓 Dark mode & Light mode
- 📊 Interactive charts (Recharts)
- 🔄 Real-time updates via WebSocket
- 🎨 Tailwind CSS styling

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Socket.io-client** - Real-time communication
- **Lucide Icons** - Modern icon library

### Backend
- **Node.js** + **Express** + TypeScript
- **MQTT.js** - MQTT client
- **Socket.io** - WebSocket server
- **Prisma ORM** - Database ORM

### Database
- **PostgreSQL 16** - Relational database

### Infrastructure
- **Docker** & **Docker Compose**
- **HiveMQ** - MQTT Broker (broker.hivemq.com)

## 🔌 IoT Integration

Dashboard ini terhubung dengan ESP32 yang menggunakan:
- Sensor IR untuk deteksi pengunjung
- Servo motor untuk kontrol gate
- MQTT protocol untuk komunikasi

### MQTT Topics
- **Publish (ESP32 → Dashboard)**: `gacoan-resto/sensor`
  - Payload: `add` (pengunjung masuk) atau `remove` (pengunjung keluar)
- **Subscribe (Dashboard → ESP32)**: `gacoan-resto/dashboard/capacity`
  - Payload: Angka kapasitas maksimal (contoh: `100`)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Resto-Dashboard
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file sesuai kebutuhan:
   ```env
   # Database
   POSTGRES_USER=resto_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=resto_dashboard
   DATABASE_URL=postgresql://resto_user:your_secure_password@postgres:5432/resto_dashboard

   # MQTT Configuration
   MQTT_BROKER=broker.hivemq.com
   MQTT_PORT=1883
   MQTT_TOPIC_SENSOR=gacoan-resto/sensor
   MQTT_TOPIC_CAPACITY=gacoan-resto/dashboard/capacity

   # Backend
   BACKEND_PORT=4000
   NODE_ENV=production

   # Frontend
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_WS_URL=http://localhost:4000

   # Restaurant Config
   DEFAULT_MAX_CAPACITY=100
   RESTAURANT_NAME=Gacoan Resto
   ```

3. **Build dan jalankan dengan Docker Compose**

   **Production Mode** (recommended):
   ```bash
   docker compose up -d --build
   ```

   **Development Mode** (with hot reload):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

4. **Akses aplikasi**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/dashboard
   - Database: localhost:5432

### Development Mode (Without Docker)

Jika ingin development tanpa Docker:

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production vs Development

- **Production** (`docker compose up`):
  - Uses built/compiled code from Docker images
  - No volume mounts (faster, isolated)
  - Recommended for deployment

- **Development** (`docker compose -f docker-compose.yml -f docker-compose.dev.yml up`):
  - Mounts local code into containers
  - Hot reload on code changes
  - Slower startup, good for active development

## 📊 Database Schema

### VisitorLog
Menyimpan setiap event masuk/keluar pengunjung
- `id`: UUID
- `type`: entry | exit
- `timestamp`: DateTime

### HourlyStatistic
Agregasi statistik per jam
- `date`: Date
- `hour`: 0-23
- `entryCount`: Jumlah pengunjung masuk
- `exitCount`: Jumlah pengunjung keluar
- `peakVisitors`: Puncak pengunjung di jam tersebut

### CurrentStatus
Status real-time restoran (singleton)
- `currentVisitors`: Jumlah pengunjung saat ini
- `maxCapacity`: Kapasitas maksimal
- `isOpen`: Status buka/tutup

### Configuration
Key-value configuration storage

## 🔧 API Endpoints

### GET `/api/dashboard`
Mendapatkan data dashboard lengkap
```json
{
  "currentVisitors": 25,
  "maxCapacity": 100,
  "availableSeats": 75,
  "occupancyRate": 25,
  "status": "open",
  "isOpen": true
}
```

### GET `/api/stats/hourly`
Statistik per jam hari ini
```json
[
  {
    "hour": 0,
    "entryCount": 5,
    "exitCount": 3,
    "peakVisitors": 10
  },
  ...
]
```

### GET `/api/events/recent?limit=20`
Event terbaru masuk/keluar

### POST `/api/capacity`
Update kapasitas maksimal (akan publish ke MQTT)
```json
{
  "capacity": 150
}
```

### POST `/api/status/toggle`
Toggle status buka/tutup
```json
{
  "isOpen": true
}
```

### GET `/health`
Health check endpoint

## 🔄 Real-time Events (WebSocket)

Socket.io events yang tersedia:

### Server → Client
- `dashboard:update` - Update data dashboard
- `stats:hourly` - Update statistik per jam
- `visitor:event` - Event real-time pengunjung masuk/keluar

### Client → Server
- `connection` - Koneksi established
- `disconnect` - Koneksi terputus

## 🎨 Customization

### Logo
Ganti logo placeholder di `frontend/src/app/page.tsx`:
```tsx
<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
  <span className="text-2xl font-bold text-primary-foreground">R</span>
</div>
```

Atau tambahkan image:
```tsx
<Image src="/logo.png" alt="Logo" width={48} height={48} />
```

### Theme Colors
Edit colors di `frontend/tailwind.config.js` dan `frontend/src/app/globals.css`

### MQTT Broker
Untuk menggunakan broker MQTT pribadi, update `.env`:
```env
MQTT_BROKER=your-mqtt-broker.com
MQTT_PORT=1883
```

## 🐛 Troubleshooting

### Container tidak bisa start
```bash
docker-compose down -v
docker-compose up -d --build
```

### Database migration error
```bash
docker-compose exec backend npx prisma migrate deploy
```

### MQTT tidak terhubung
- Pastikan broker MQTT aktif dan accessible
- Cek firewall settings
- Verifikasi MQTT_BROKER di `.env`

### Frontend tidak bisa connect ke backend
- Pastikan `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_WS_URL` benar
- Cek CORS settings di backend

## 📝 Project Structure

```
Resto-Dashboard/
├── backend/                 # Backend service (Node.js + Express)
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── api/            # REST API routes
│   │   ├── mqtt/           # MQTT subscriber service
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & socket
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
├── .env.example           # Environment variables template
└── README.md              # Documentation
```

## 🔐 Security Notes

⚠️ **Untuk Production:**
1. Ganti semua password default di `.env`
2. Gunakan HTTPS untuk frontend & backend
3. Setup firewall rules
4. Enable authentication untuk MQTT broker
5. Setup rate limiting di API
6. Regular backup database

## 📄 License

MIT License - silakan gunakan untuk project pribadi maupun komersial.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.

---

**Built with ❤️ using Next.js, Node.js, MQTT, and Docker**
