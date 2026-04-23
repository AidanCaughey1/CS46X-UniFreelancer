import React from 'react';

function AcademySignals() {
  return (
    <section className="relative z-[2] my-8 mb-10 flex flex-wrap gap-2.5 md:gap-2" aria-label="Academy outcomes">
      <div className="rounded-full border border-border bg-light-tertiary px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.5px] text-dark-primary">
        Expert-led live sessions
      </div>
      <div className="rounded-full border border-border bg-light-tertiary px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.5px] text-dark-primary">
        Certificate-ready milestones
      </div>
      <div className="rounded-full border border-border bg-light-tertiary px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.5px] text-dark-primary">
        Community backed accountability
      </div>
    </section>
  );
}

export default AcademySignals;
