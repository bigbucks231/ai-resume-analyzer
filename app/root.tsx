import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { useEffect, useRef } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import {usePuterStore } from "~/lib/puter";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const { init } = usePuterStore();
    const initRef = useRef(init);

    useEffect(() => {
        console.log('Layout component mounted, loading Puter.js script');

        // Check if script is already loaded
        if (window.puter) {
            console.log('Puter.js already available, initializing directly');
            initRef.current();
            return;
        }

        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;
        script.id = 'puter-script';

        // Initialize Puter after the script has loaded
        script.onload = () => {
            console.log('Puter.js script loaded successfully');
            // Give a small delay to ensure the script is fully initialized
            setTimeout(() => {
                initRef.current();
            }, 100);
        };

        // Handle script loading errors
        script.onerror = (error) => {
            console.error('Failed to load Puter.js script:', error);
            // Try to initialize anyway in case the script was already loaded
            setTimeout(() => {
                try {
                    if (window.puter) {
                        console.log('Puter.js available despite load error, initializing');
                        initRef.current();
                    } else {
                        console.error('Puter.js not available after load error');
                    }
                } catch (error) {
                    console.error('Failed to initialize Puter:', error);
                }
            }, 1000);
        };

        // Add the script to the document
        document.body.appendChild(script);
        console.log('Puter.js script added to document body');

        // Cleanup function to remove the script when component unmounts
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
                console.log('Puter.js script removed from document body');
            }
        };
    }, []);

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
            )}
        </main>
    );
}
