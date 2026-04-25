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
    title: '短暂的服务中断',
    description: '由于数据库维护，服务在 14:00-14:15 UTC 期间不可用。所有服务已恢复正常。',
    status: 'resolved',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服务状态</h1>

          {/* Overall Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-lg font-medium text-green-800">所有系统正常运行</span>
            </div>
            <p className="text-green-600 mt-2">最后检查：刚刚</p>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">服务状态</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">90 天运行时间：{service.uptime}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {service.status === 'operational' ? '正常运行' : service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">最近事件</h2>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.date}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{incident.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      已解决
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{incident.date}</p>
                  <p className="text-gray-600">{incident.description}</p>
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
