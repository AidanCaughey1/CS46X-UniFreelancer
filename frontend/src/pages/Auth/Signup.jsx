import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Signup = () => {
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        accountType: 'student',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            alert("Password must be at least 8 characters long and contain at least one number and one special character.");
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    email: formData.email,
                    accountType: formData.accountType,
                    password: formData.password
                }),
                credentials: 'include', // Important for cookies
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Signup successful:', data);
                const params = new URLSearchParams(location.search);
                const returnTo = params.get('returnTo');
                const safeReturnTo = returnTo && returnTo.startsWith('/') ? returnTo : null;

                // Redirect and reload to update App state (Auto-login)
                window.location.href = safeReturnTo || '/';
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        }
    };

    const inputClasses = "w-full px-4 py-3 rounded border border-[#ddd] bg-[#f9f9f9] text-base transition-all duration-300 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10 focus:bg-white md:text-md md:py-3 md:px-3";
    const passwordInputClasses = "w-full px-4 py-3 pr-11 rounded border border-[#ddd] bg-[#f9f9f9] text-base transition-all duration-300 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10 focus:bg-white md:text-md md:py-3 md:pr-10";
    const labelClasses = "block mb-2 text-dark-secondary font-medium text-sm md:text-sm";

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] p-5 sm:min-h-[calc(100vh-60px)]">
            <div className="bg-white/90 backdrop-blur-[10px] rounded-xl shadow-glass border border-white/20 p-10 w-full max-w-form text-center md:p-8 md:px-6 md:rounded-[15px] md:max-w-full sm:p-6 sm:px-5 sm:rounded-md">
                <h2 className="mb-3 text-dark font-bold text-4xl md:text-2xl sm:text-[1.3rem]">Create Account</h2>
                <p className="text-[#666] mb-8 text-md md:text-sm">Join UniFreelancer Academy today.</p>

                <form className="flex flex-col gap-5 sm:gap-[15px]" onSubmit={handleSubmit}>
                    <div className="text-left">
                        <label htmlFor="firstName" className={labelClasses}>First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="username" className={labelClasses}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Choose a username (4-24 characters)"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength="4"
                            maxLength="24"
                            className={inputClasses}
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="email" className={labelClasses}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="accountType" className={labelClasses}>Account Type</label>
                        <select
                            id="accountType"
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>

                    <div className="text-left">
                        <label htmlFor="password" className={labelClasses}>Password</label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={passwordInputClasses}
                            />
                            <button
                                type="button"
                                className="absolute right-2.5 bg-transparent border-none cursor-pointer text-[#888] flex items-center justify-center p-1 transition-colors duration-200 hover:text-accent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-left">
                        <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                        <div className="relative flex items-center">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={passwordInputClasses}
                            />
                            <button
                                type="button"
                                className="absolute right-2.5 bg-transparent border-none cursor-pointer text-[#888] flex items-center justify-center p-1 transition-colors duration-200 hover:text-accent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="mt-3 py-4 rounded border-none bg-accent text-white text-base font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:py-3 md:text-md">Sign Up</button>
                </form>

                <div className="mt-6 text-sm text-[#666] md:text-sm">
                    Already have an account?
                    <Link to={`/login${location.search || ''}`} className="text-accent no-underline font-semibold ml-1 transition-colors duration-200 hover:text-accent-secondary hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
