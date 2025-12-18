import React, { useState } from 'react';
import { Lock, X, Loader } from 'lucide-react';
import { verifyPasswordApi } from '../services/apiService';

interface PasswordChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    username: string;
    actionName: string;
}

const PasswordChallengeModal: React.FC<PasswordChallengeModalProps> = ({
    isOpen, onClose, onSuccess, username, actionName
}) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await verifyPasswordApi({ username, password });
            if (res && res.success) {
                onSuccess();
                onClose();
                setPassword('');
            } else {
                setError('Incorrect password');
            }
        } catch (e) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock size={20} className="text-blue-500" /> Security Check
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-slate-400 text-sm mb-4">
                        Please enter your admin password to <span className="text-white font-semibold">{actionName}</span>.
                    </p>

                    <input
                        type="password"
                        autoFocus
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors mb-3"
                    />

                    {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader size={16} className="animate-spin" />}
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChallengeModal;
