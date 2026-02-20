"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { logIn } from "./utils/auth-functions";

export default function Login() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [buttonClicked, setButtonClicked] = useState<boolean>(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setButtonClicked(true);
		const form = e.currentTarget;
		const formData = new FormData(form);
		const { user, message } = await logIn(formData);
		if (!user) {
			alert(message);
			setButtonClicked(false);
		} else {
			alert(message);
			form.reset();
			router.push("/home");
		}
	};

	return (
		<div className='min-h-screen bg-[#121212] flex flex-col items-center justify-center font-sans text-white p-4'>
			{/* Container matching your wireframe structure */}
			<div className='w-full max-w-120 space-y-8'>
				{/* Title: Stream Shop & Chat */}
				<div className='text-center'>
					<h1 className='text-4xl md:text-5xl font-black tracking-tight mb-2'>
						Stream Live & Shop
					</h1>
					<p className='text-gray-400 font-medium'>Log in to your account</p>
				</div>

				{/* Form Section */}
				<form className='space-y-6' onSubmit={handleSubmit}>
					{/* Email Address Field */}
					<div className='space-y-2'>
						<label className='text-sm font-bold text-gray-200 ml-1'>
							Email Address
						</label>
						<input
							type='email'
							name='email'
							id='email'
							required
							placeholder='Enter your email address'
							className='w-full bg-[#2f2f2f] border border-transparent focus:border-gray-500 focus:bg-[#333] outline-none rounded-sm px-4 py-3 text-base transition-all placeholder:text-gray-500'
						/>
					</div>

					{/* Password Field */}
					<div className='space-y-2'>
						<label className='text-sm font-bold text-gray-200 ml-1'>
							Password
						</label>
						<div className='relative'>
							<input
								type={showPassword ? "text" : "password"}
								name='password'
								id='password'
								minLength={8}
								required
								placeholder='Enter your password'
								className='w-full bg-[#2f2f2f] border border-transparent focus:border-gray-500 focus:bg-[#333] outline-none rounded-sm px-4 py-3 text-base transition-all placeholder:text-gray-500'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{/* Login Button - TikTok Primary Color */}
					<button
						disabled={buttonClicked}
						type='submit'
						className='w-full bg-[#fe2c55] hover:bg-[#ef2950] active:scale-[0.98] transition-all text-white font-bold py-3 rounded-sm text-lg mt-4 shadow-lg shadow-[#fe2c55]/10 cursor-pointer disabled:cursor-not-allowed disabled:bg-[#fe2c55]/70'
					>
						{buttonClicked ? "Logging in..." : "Log In"}
					</button>
				</form>

				{/* Footer Link */}
				<div className='text-center text-[15px]'>
					<span className='text-gray-400'>Don&apos;t have an account? </span>
					<Link
						href='/signup'
						className='text-[#fe2c55] font-bold hover:underline ml-1'
					>
						Sign up
					</Link>
				</div>
			</div>

			{/* Decorative Bottom Tag (TikTok Style) */}
			<div className='absolute bottom-10 text-gray-600 text-xs font-semibold uppercase tracking-widest'>
				© 2024 Stream Shop & Chat
			</div>
		</div>
	);
};

