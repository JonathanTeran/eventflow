import '@/styles/public-layout.css';
import { usePage } from '@inertiajs/react';

export default function PublicLayout({ children, isPreview }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="public-layout">
            {isPreview && (
                <div className="preview-banner">
                    Vista previa — Esta pagina aun no es visible al publico.
                </div>
            )}

            <header className="public-header">
                <a href="/" className="public-header__logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'middle', color: '#ec7211' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    BuilderApp
                </a>
                <nav className="public-header__nav">
                    {user ? (
                        <>
                            <span className="public-header__user">{user.first_name} {user.last_name}</span>
                            <a href="/dashboard" className="public-header__link public-header__link--primary">
                                Dashboard
                            </a>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="public-header__link">
                                Iniciar sesion
                            </a>
                            <a href="/register" className="public-header__link public-header__link--primary">
                                Crear cuenta
                            </a>
                        </>
                    )}
                </nav>
            </header>

            <main className="public-main">
                {children}
            </main>

            <footer className="public-footer">
                <div className="public-footer__inner">
                    <div className="public-footer__brand">
                        <span className="public-footer__logo">BuilderApp</span>
                        <p className="public-footer__tagline">La plataforma para crear y gestionar eventos de tecnologia.</p>
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
