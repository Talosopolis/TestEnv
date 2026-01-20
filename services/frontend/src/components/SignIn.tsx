import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, Info, Triangle } from "lucide-react";
import { isConfigured } from "../firebase";
import { PageLayout } from "./ui/PageLayout";

const LOGIN_QUOTES = [
    { text: "The beginning is the most important part of the work.", author: "Plato" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "Step into the light.", author: "Talos Protocol" }
];

export function SignIn({ onBack, onSuccess, initialMode = 'signin' }: { onBack: () => void, onSuccess: () => void, initialMode?: 'signin' | 'signup' }) {
    const { signIn, isLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        console.log("DEBUG: Login Button Clicked");
        setError(null);
        try {
            console.log("DEBUG: Calling AuthContext.signIn()");
            await signIn();
            console.log("DEBUG: AuthContext.signIn() returned");
            onSuccess();
        } catch (e: any) {
            console.error("Login failed", e);
            setError(e.message || "Failed to sign in. Check console.");
        }
    };

    return (
        <PageLayout quotes={LOGIN_QUOTES} showTicker={true}>
            <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 font-serif">
                <div className="w-full max-w-md bg-stone-900 border border-amber-900/30 rounded-none shadow-2xl overflow-hidden relative">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none"></div>

                    <div className="bg-stone-950 p-8 text-center border-b border-amber-900/30 relative">
                        <div className="absolute top-4 left-4 opacity-20">
                            <Triangle className="w-6 h-6 text-amber-500 rotate-180" />
                        </div>
                        <h2 className="text-2xl font-bold text-amber-500 tracking-widest uppercase">
                            Authorization
                        </h2>
                        <p className="text-stone-500 text-xs mt-2 tracking-wide">
                            ENTER CREDENTIALS
                        </p>

                        {isConfigured && (
                            <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-stone-600 uppercase tracking-widest">
                                <Info className="w-3 h-3" /> Secure Connection
                            </div>
                        )}
                    </div>

                    <div className="p-8 space-y-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-stone-100 hover:bg-white text-stone-900 font-bold py-4 px-4 transition-all shadow-sm hover:shadow-md"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            <span className="flex-1 text-center">ACCESS VIA GOOGLE</span>
                        </button>

                        <p className="text-[10px] text-stone-500 text-center uppercase tracking-widest">
                            Secure Access Only. <br /> Non-S.S.O. methods deprecated.
                        </p>

                        {error && (
                            <div className="mt-4 text-red-500 text-xs text-center border border-red-900/30 bg-red-950/20 p-2 uppercase tracking-wide">
                                <p className="mb-2">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
