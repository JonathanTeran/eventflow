import '@cloudscape-design/global-styles/index.css';
import '@/styles/public-layout.css';
import { usePage } from '@inertiajs/react';
import TopNavigation from '@cloudscape-design/components/top-navigation';

export default function PublicLayout({ children, isPreview }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const utilities = user
        ? [
              {
                  type: 'menu-dropdown',
                  text: `${user.first_name} ${user.last_name}`,
                  iconName: 'user-profile',
                  items: [
                      { id: 'dashboard', text: 'Dashboard', href: '/dashboard' },
                      { id: 'logout', text: 'Cerrar sesion', href: '/logout' },
                  ],
              },
          ]
        : [
              {
                  type: 'button',
                  text: 'Iniciar sesion',
                  href: '/login',
              },
              {
                  type: 'button',
                  variant: 'primary-button',
                  text: 'Crear cuenta',
                  href: '/register',
              },
          ];

    return (
        <div className="public-layout">
            {isPreview && (
                <div className="preview-banner">
                    Vista previa — Esta pagina aun no es visible al publico.
                </div>
            )}

            <TopNavigation
                identity={{
                    href: '/',
                    title: 'BuilderApp',
                }}
                utilities={utilities}
            />

            <main className="public-main">{children}</main>

            <footer className="public-footer">
                <div className="public-footer__inner">
                    <div className="public-footer__brand">
                        <span className="public-footer__logo">BuilderApp</span>
                        <p className="public-footer__tagline">
                            La plataforma para crear y gestionar eventos de tecnologia.
                        </p>
                    </div>
                    <div className="public-footer__links">
                        <a href="/login">Iniciar sesion</a>
                        <a href="/register">Crear cuenta</a>
                    </div>
                </div>
                <div className="public-footer__bottom">
                    &copy; {new Date().getFullYear()} BuilderApp. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
