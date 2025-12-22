import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

export const DebugAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { isAdmin, isLoading: permissionsLoading, error } = useAdminPermissions();

  console.log('🐛🐛🐛 [DebugAuth] RENDERIZADO');
  console.log('🐛🐛🐛 [DebugAuth] user:', user);
  console.log('🐛🐛🐛 [DebugAuth] authLoading:', authLoading);
  console.log('🐛🐛🐛 [DebugAuth] role:', role);
  console.log('🐛🐛🐛 [DebugAuth] roleLoading:', roleLoading);
  console.log('🐛🐛🐛 [DebugAuth] isAdmin:', isAdmin);
  console.log('🐛🐛🐛 [DebugAuth] permissionsLoading:', permissionsLoading);
  console.log('🐛🐛🐛 [DebugAuth] error:', error);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug de Autenticação</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Estado da Autenticação</h2>
          <p><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</p>
          <p><strong>Loading Auth:</strong> {authLoading ? 'Sim' : 'Não'}</p>
          <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Role do Usuário</h2>
          <p><strong>Role:</strong> {role || 'Não definido'}</p>
          <p><strong>Loading Role:</strong> {roleLoading ? 'Sim' : 'Não'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Permissões de Admin</h2>
          <p><strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
          <p><strong>Loading Permissions:</strong> {permissionsLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Ações</h2>
          <button 
            onClick={() => window.location.href = '/admin-login'}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Ir para Login Admin
          </button>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Tentar Acessar Admin
          </button>
        </div>
      </div>
    </div>
  );
};