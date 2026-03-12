import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function AcademyPlans() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSignedIn = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/users/me`, {
          credentials: 'include'
        });
        setIsSignedIn(response.ok);
      } catch (_error) {
        setIsSignedIn(false);
      }
    };

    checkSignedIn();
  }, []);

  const handleFreeSelect = () => {
    if (!isSignedIn) {
      navigate('/signup');
    }
  };

  return (
    <section className="my-5 mb-10 rounded-[30px] p-8 bg-light-tertiary border border-border shadow-card md:p-6" aria-label="Subscription plans">
      <div className="mb-5">
        <span className="inline-block uppercase text-[11px] font-bold tracking-[2px] text-accent mb-1.5">Subscriptions</span>
        <h3 className="text-[30px] text-dark-primary mb-2 md:text-2xl">Pick the plan that fits your pace</h3>
        <p className="text-md text-dark-secondary">Start free, then upgrade when you want deeper access and more live experiences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
        <article
          className={`rounded-[22px] border border-border p-6 bg-light-secondary relative overflow-hidden min-h-[530px] flex flex-col transition-all duration-[250ms] ease-in-out before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-[5px] before:bg-dark-primary/90 hover:-translate-y-1 hover:shadow-card-hover ${!isSignedIn ? 'cursor-pointer' : ''}`}
          onClick={handleFreeSelect}
          role={!isSignedIn ? 'button' : undefined}
          tabIndex={!isSignedIn ? 0 : -1}
          onKeyDown={(event) => {
            if (isSignedIn) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleFreeSelect();
            }
          }}
          aria-label={!isSignedIn ? 'Sign up for free plan' : 'Free plan'}
        >
          <h4 className="text-2xl text-dark-primary mb-1">Free</h4>
          <p className="text-3xl font-bold text-accent mb-1.5">$0/mo</p>
          <p className="text-sm text-dark-secondary mb-3.5">Get started and explore</p>
          <ul className="list-none m-0 mb-5 p-0 flex flex-col gap-2 flex-1">
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Access to free courses</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Access to free tutorials</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Limited seminars + podcasts</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Limited resource downloads</li>
          </ul>
          <button className="w-full border border-border rounded-full py-2.5 px-3.5 text-sm font-bold cursor-pointer bg-main-bg text-dark-primary" onClick={handleFreeSelect}>
            Start Free
          </button>
        </article>

        <article className="rounded-[22px] border border-accent/50 p-6 bg-main-bg relative overflow-hidden min-h-[530px] flex flex-col transition-all duration-[250ms] ease-in-out shadow-accent before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-[5px] before:bg-accent-secondary hover:-translate-y-1 hover:shadow-card-hover">
          <span className="absolute top-3 right-3 inline-flex rounded-full py-[5px] px-[9px] text-[10px] font-bold uppercase tracking-[0.5px] text-white bg-accent">Most popular</span>
          <h4 className="text-2xl text-dark-primary mb-1">Plus</h4>
          <p className="text-3xl font-bold text-accent mb-1.5">$14.99/mo</p>
          <p className="text-sm text-dark-secondary mb-3.5">Best for consistent learners</p>
          <ul className="list-none m-0 mb-5 p-0 flex flex-col gap-2 flex-1">
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Access to most courses</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Full tutorials library</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Expanded seminars + podcasts</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />10 resource downloads / month</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Monthly AI feedback credits</li>
          </ul>
          <button className="w-full border-none rounded-full py-2.5 px-3.5 text-sm font-bold cursor-pointer bg-accent text-white">Choose Plus</button>
        </article>

        <article className="rounded-[22px] border border-border p-6 bg-light-secondary relative overflow-hidden min-h-[530px] flex flex-col transition-all duration-[250ms] ease-in-out before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-[5px] before:bg-accent hover:-translate-y-1 hover:shadow-card-hover">
          <h4 className="text-2xl text-dark-primary mb-1">Premium</h4>
          <p className="text-3xl font-bold text-accent mb-1.5">$24.99/mo</p>
          <p className="text-sm text-dark-secondary mb-3.5">For power learners and creators</p>
          <ul className="list-none m-0 mb-5 p-0 flex flex-col gap-2 flex-1">
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Full access to all academy content</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Unlimited resource downloads</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />Unlimited AI feedback (Fair Use)</li>
            <li className="flex items-center gap-2 text-sm text-dark-secondary leading-[1.65]"><FiCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-[#21a35c] border border-[rgba(33,163,92,0.45)] rounded-full p-0.5 bg-main-bg" />AI-assisted creator tools</li>
          </ul>
          <p className="-mt-1.5 mb-3.5 text-[11px] leading-[1.4] text-[#666]">Unlimited AI is subject to fair use and anti-abuse protections.</p>
          <button className="w-full border-none rounded-full py-2.5 px-3.5 text-sm font-bold cursor-pointer bg-accent-secondary text-white">Go Premium</button>
        </article>
      </div>
    </section>
  );
}

export default AcademyPlans;
