import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">

                        {/* CARD */}
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">

                            <div className="flex flex-col items-center text-center">

                                {/* 🔥 Added Logo Here */}
                                <img
                                    src="https://npontu.com/wp-content/uploads/2023/11/Logo-copy-3.png"
                                    alt="Npontu Logo"
                                    className="w-28 mb-4"
                                />

                                <h1 className="text-3xl font-semibold mb-2 dark:text-white">
                                    Npontu Activity Tracker
                                </h1>

                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] mb-8 max-w-sm">
                                    Stay organized, track your daily tasks, and improve your productivity.
                                </p>

                                {/* Buttons stay the same */}
                                <div className="flex gap-4 mt-3">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="px-6 py-2 rounded-md bg-black text-white text-sm dark:bg-white dark:text-black hover:opacity-90 transition"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="px-6 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                            >
                                                Log in
                                            </Link>

                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    className="px-6 py-2 rounded-md bg-black text-white text-sm dark:bg-white dark:text-black hover:opacity-90 transition"
                                                >
                                                    Register
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
