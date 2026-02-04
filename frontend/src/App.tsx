import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Settings, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContractService, PropertyService, TenantService, type Property, type Tenant, type DashboardMetrics } from './api/services';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col border-r border-slate-800">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Inmonea
            </h1>
            <p className="text-sm text-slate-400">Gestión Integral</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} text="Dashboard" />
            <NavItem to="/inquilinos" icon={<Users size={20} />} text="Inquilinos" />
            <NavItem to="/propiedades" icon={<Home size={20} />} text="Propiedades" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <NavItem to="/configuracion" icon={<Settings size={20} />} text="Configuración" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <header className={`h-16 flex items-center px-8 justify-between shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Panel de Control</h2>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-gray-100 text-slate-600'}`}
                title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                  A
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            <Routes>
              <Route path="/" element={<DashboardHome isDarkMode={isDarkMode} />} />
              <Route path="/inquilinos" element={<TenantsPage isDarkMode={isDarkMode} />} />
              <Route path="/propiedades" element={<PropertiesPage isDarkMode={isDarkMode} />} />
              <Route path="/configuracion" element={<div className="p-8 text-slate-500">Página de Configuración (Próximamente)</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, text }: { to: string, icon: any, text: string }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 
      ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span className="font-medium">{text}</span>
    </Link>
  )
}

function DashboardHome({ isDarkMode }: { isDarkMode: boolean }) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeContracts: 0,
    monthlyIncome: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ContractService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className={`p-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Cargando datos del sistema...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Ingresos Mensuales (Est.)"
        value={`$${metrics.monthlyIncome.toLocaleString()}`}
        trend="Calculado"
        isDarkMode={isDarkMode}
      />
      <StatCard
        title="Contratos Activos"
        value={metrics.activeContracts.toString()}
        trend="Actualizado"
        isDarkMode={isDarkMode}
      />
      <StatCard
        title="Pagos Pendientes"
        value={metrics.pendingPayments.toString()}
        trend="Verificar"
        isNegative
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

function TenantsPage({ isDarkMode }: { isDarkMode: boolean }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      const data = await TenantService.getAll();
      setTenants(data);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (newTenant: any) => {
    try {
      await TenantService.create({ ...newTenant, agency_id: 1 });
      setIsModalOpen(false);
      fetchTenants();
    } catch (error) {
      alert("Error al crear el inquilino");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Inquilinos</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          + Nuevo Inquilino
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Cargando inquilinos...</div>
      ) : tenants.length === 0 ? (
        <div className={`rounded-2xl shadow-sm border p-12 text-center transition-colors duration-300
          ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-500'}`}>
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p>No hay inquilinos registrados actualmente.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className={isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600'}>
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Teléfono</th>
                <th className="px-6 py-4 font-semibold">DNI</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? 'text-slate-400' : 'text-gray-700'}>
              {tenants.map(tenant => (
                <tr key={tenant.id} className={`border-t ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{tenant.full_name}</td>
                  <td className="px-6 py-4">{tenant.phone}</td>
                  <td className="px-6 py-4">{tenant.dni}</td>
                  <td className="px-6 py-4">
                    <button className="text-brand-500 hover:underline text-sm font-medium">Ver Contratos</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <TenantModal
          isDarkMode={isDarkMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTenant}
        />
      )}
    </div>
  );
}

function PropertiesPage({ isDarkMode }: { isDarkMode: boolean }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      const data = await PropertyService.getAll();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateProperty = async (newProp: any) => {
    try {
      await PropertyService.create({ ...newProp, agency_id: 1 }); // Hardcoded agency_id for now
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) {
      alert("Error al crear la propiedad");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Catálogo de Propiedades</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          + Nueva Propiedad
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Cargando propiedades...</div>
      ) : properties.length === 0 ? (
        <div className={`rounded-2xl shadow-sm border p-12 text-center transition-colors duration-300
          ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-500'}`}>
          <Home size={48} className="mx-auto mb-4 opacity-20" />
          <p>No hay propiedades listadas en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(prop => (
            <div key={prop.id} className={`p-6 rounded-2xl shadow-sm border transition-all duration-300
              ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${prop.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {prop.status === 'available' ? 'Disponible' : 'Alquilada'}
                </span>
                <span className={`font-bold ${isDarkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                  ${prop.price?.toLocaleString()}
                </span>
              </div>
              <h4 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{prop.address}</h4>
              <p className="text-sm text-slate-500 mb-4">{prop.city} • {
                prop.type === 'apartment' ? 'Departamento' : prop.type === 'house' ? 'Casa' : 'Local'
              }</p>
              {prop.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                  <img
                    src={prop.image_url}
                    alt={prop.address}
                    className="w-full h-full object-cover"
                    onError={(e: any) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Propietario: {prop.owner_name}</span>
                <button className="text-brand-500 text-sm font-medium hover:underline">Ver detalles</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <PropertyModal
          isDarkMode={isDarkMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProperty}
        />
      )}
    </div>
  );
}

function PropertyModal({ isDarkMode, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    type: 'apartment',
    status: 'available',
    price: '',
    owner_name: '',
    image_url: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-xl font-bold mb-6">Agregar Nueva Propiedad</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, price: parseFloat(formData.price) }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Dirección</label>
            <input
              required
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Ciudad</label>
              <input
                required
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Precio</label>
              <input
                required
                type="number"
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Tipo</label>
              <select
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="apartment">Departamento</option>
                <option value="house">Casa</option>
                <option value="local">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Estatus</label>
              <select
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Disponible</option>
                <option value="rented">Alquilada</option>
                <option value="sold">Vendida</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Propietario</label>
            <input
              required
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.owner_name}
              onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">URL de la Imagen (Opcional)</label>
            <input
              placeholder="https://ejemplo.com/foto.jpg"
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.image_url}
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-xl font-medium ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function TenantModal({ isDarkMode, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dni: '',
    address: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-xl font-bold mb-6">Registrar Nuevo Inquilino</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Nombre Completo</label>
            <input
              required
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">WhatsApp</label>
              <input
                required
                placeholder="Ex: 5493624..."
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">DNI</label>
              <input
                required
                className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                value={formData.dni}
                onChange={e => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Dirección Actual</label>
            <input
              className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-xl font-medium ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isNegative, isDarkMode }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md
      ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-gray-100'}`}>
      <h3 className={isDarkMode ? 'text-slate-400 text-sm font-medium' : 'text-gray-500 text-sm font-medium'}>{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        <span className={`text-sm font-medium ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

export default App;
