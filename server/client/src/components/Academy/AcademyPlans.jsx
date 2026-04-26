import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function AcademyPlans() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSignedIn = async () => {
      try {
        const response = await fetch('/api/users/me', {
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

  const checkIconClasses = 'h-4 w-4 shrink-0 rounded-full border border-[rgba(33,163,92,0.45)] bg-main-bg p-0.5 text-[#21a35c]';

  return (
    <section className="my-5 mb-10 rounded-[30px] border border-border bg-light-tertiary p-8 shadow-card md:p-6" aria-label="Subscription plans">
      <div className="mb-5">
        <span className="mb-1.5 inline-block text-[9px] font-bold uppercase tracking-[2px] text-accent">Subscriptions</span>
        <h3 className="mb-2 text-2xl text-dark-primary">Pick the plan that fits your pace</h3>
        <p className="text-md text-dark-secondary">Start free, then upgrade when you want deeper access and more live experiences.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article
          className={`relative flex min-h-[530px] flex-col overflow-hidden rounded-[22px] border border-border bg-light-secondary p-6 transition-all duration-[250ms] ease-in-out before:absolute before:left-0 before:top-0 before:h-[5px] before:w-full before:bg-dark-primary/90 before:content-[''] hover:-translate-y-1 hover:shadow-card-hover ${!isSignedIn ? 'cursor-pointer' : ''}`}
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
          <h4 className="mb-1 text-2xl text-dark-primary">Free</h4>
          <p className="mb-1.5 text-3xl font-bold text-accent">$0/mo</p>
          <p className="mb-3.5 text-sm text-dark-secondary">Get started and explore</p>
          <ul className="mb-5 flex flex-1 flex-col gap-2 p-0">
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Access to free courses</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Access to free tutorials</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Limited seminars + podcasts</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Limited resource downloads</li>
          </ul>
          <button className="w-full rounded-full border border-border bg-main-bg px-3.5 py-2.5 text-sm font-bold text-dark-primary" onClick={handleFreeSelect}>
            Start Free
          </button>
        </article>

        <article className="relative flex min-h-[530px] flex-col overflow-hidden rounded-[22px] border border-accent/50 bg-main-bg p-6 shadow-accent transition-all duration-[250ms] ease-in-out before:absolute before:left-0 before:top-0 before:h-[5px] before:w-full before:bg-accent-secondary before:content-[''] hover:-translate-y-1 hover:shadow-card-hover">
          <span className="absolute right-3 top-3 inline-flex rounded-full bg-accent px-[9px] py-[5px] text-[8px] font-bold uppercase tracking-[0.5px] text-white">Most popular</span>
          <h4 className="mb-1 text-2xl text-dark-primary">Plus</h4>
          <p className="mb-1.5 text-3xl font-bold text-accent">$14.99/mo</p>
          <p className="mb-3.5 text-sm text-dark-secondary">Best for consistent learners</p>
          <ul className="mb-5 flex flex-1 flex-col gap-2 p-0">
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Access to most courses</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Full tutorials library</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Expanded seminars + podcasts</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />10 resource downloads / month</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Monthly AI feedback credits</li>
          </ul>
          <button className="w-full rounded-full border-none bg-accent px-3.5 py-2.5 text-sm font-bold text-white" type="button">Choose Plus</button>
        </article>

        <article className="relative flex min-h-[530px] flex-col overflow-hidden rounded-[22px] border border-border bg-light-secondary p-6 transition-all duration-[250ms] ease-in-out before:absolute before:left-0 before:top-0 before:h-[5px] before:w-full before:bg-accent before:content-[''] hover:-translate-y-1 hover:shadow-card-hover">
          <h4 className="mb-1 text-2xl text-dark-primary">Premium</h4>
          <p className="mb-1.5 text-3xl font-bold text-accent">$24.99/mo</p>
          <p className="mb-3.5 text-sm text-dark-secondary">For power learners and creators</p>
          <ul className="mb-5 flex flex-1 flex-col gap-2 p-0">
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Full access to all academy content</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Unlimited resource downloads</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />Unlimited AI feedback (Fair Use)</li>
            <li className="flex items-center gap-2 text-sm leading-[1.65] text-dark-secondary"><FiCheck aria-hidden="true" className={checkIconClasses} />AI-assisted creator tools</li>
          </ul>
          <p className="-mt-1.5 mb-3.5 text-[9px] leading-[1.4] text-[#666]">Unlimited AI is subject to fair use and anti-abuse protections.</p>
          <button className="w-full rounded-full border-none bg-accent-secondary px-3.5 py-2.5 text-sm font-bold text-white" type="button">Go Premium</button>
        </article>
      </div>
    </section>
  );
}

export default AcademyPlans;
