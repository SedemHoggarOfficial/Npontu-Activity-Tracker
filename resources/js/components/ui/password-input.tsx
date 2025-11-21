import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    className?: string;
}

export default function PasswordInput({ error, className, ...props }: PasswordInputProps) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="relative">
            <input
                {...props}
                type={show ? 'text' : 'password'}
                data-slot="input"
                className={cn(
                    "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    error ? 'border-red-500' : '',
                    className
                )}
            />
            <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setShow((v) => !v)}
            >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
        </div>
    );
}
