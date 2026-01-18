import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied: React.FC = () => {
    const { signIn } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-amber-500 font-serif p-4">
            <ShieldAlert size={64} className="mb-4 text-red-500 animate-pulse" />
            <h1 className="text-4xl mb-2 tracking-widest border-b border-amber-900 pb-2">UNAUTHORIZED</h1>
            <p className="text-lg mb-8 text-amber-700 italic max-w-md text-center">
                "Knowledge is a heavy burden. We track its weight to ensure it is not used to break the world."
            </p>

            <button
                onClick={() => signIn()}
                className="px-8 py-3 bg-amber-900/20 border border-amber-600/50 hover:bg-amber-900/40 hover:border-amber-500 text-amber-400 font-mono text-sm tracking-wider transition-all duration-300"
            >
                [ AUTHENTICATE ]
            </button>
        </div>
    );
};

export default AccessDenied;
