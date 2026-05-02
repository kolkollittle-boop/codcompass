import Header from '@/components/Header';
import Footer from '@/components/Footer';

const services = [
  { name: 'Website', status: 'operational', uptime: '99.9%' },
  { name: 'API', status: 'operational', uptime: '99.8%' },
  { name: 'Database', status: 'operational', uptime: '99.9%' },
  { name: 'Authentication', status: 'operational', uptime: '99.9%' },
  { name: 'Payment Processing', status: 'operational', uptime: '99.7%' },
];

const incidents = [
  {
    date: '2026-04-20',
    title: 'Brief Service Interruption',
    description: 'Due to database maintenance, services were unavailable from 14:00-14:15 UTC. All services have been restored to normal.',
    status: 'resolved',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">Service Status</h1>

          {/* Overall Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-lg font-medium text-green-400">All Systems Operational</span>
            </div>
            <p className="text-green-500 mt-2">Last checked: Just now</p>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Service Status</h2>
            <div className="bg-palette-bgCard rounded-xl border border-palette-border overflow-hidden">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between px-6 py-4 border-b border-palette-border last:border-0"
                >
                  <span className="font-medium text-white">{service.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-palette-textMuted">90-day uptime: {service.uptime}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      {service.status === 'operational' ? 'Operational' : service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Incidents</h2>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.date}
                  className="bg-palette-bgCard rounded-xl border border-palette-border p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{incident.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      Resolved
                    </span>
                  </div>
                  <p className="text-sm text-palette-textMuted mb-2">{incident.date}</p>
                  <p className="text-palette-textMuted">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
