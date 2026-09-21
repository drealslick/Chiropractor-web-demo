import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Award 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-8 px-4 max-w-7xl mx-auto">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden bg-stone-900 text-white rounded-3xl p-8 md:p-14 shadow-2xl border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>€49 New Patient Consultation & Evaluation Special</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-stone-100">
            Precision Chiropractic & Functional Movement Relief
          </h1>

          <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl">
            Evidence-based spinal adjustments, soft tissue therapy, and long-term postural restoration designed for lasting pain elimination.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="/first-visit"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4" />
              <span>Claim €49 Special</span>
            </a>
            <a
              href="/conditions"
              className="inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-6 py-3.5 rounded-xl border border-stone-700 transition"
            >
              <span>View Conditions We Treat</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Certified Specialists</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>4.9 Star Patient Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GDPR Compliant Intake</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Condition Router Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Targeted Care</span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mt-1">What is causing your discomfort?</h2>
          </div>
          <a href="/conditions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            See all conditions <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/conditions/back-lower-back-pain"
            className="group p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-600 transition flex items-center justify-between">
              Lower Back & Lumbar
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              Targeted adjustments to realign lumbar vertebrae, relieve sciatica, and stabilize core posture.
            </p>
          </a>

          <a
            href="/conditions/neck-shoulder-pain"
            className="group p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-600 transition flex items-center justify-between">
              Neck & Shoulder Care
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              Alleviate desk-work strain, pinched cervical nerves, upper back stiffness, and tension headaches.
            </p>
          </a>

          <a
            href="/conditions/sports-injury"
            className="group p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-600 transition flex items-center justify-between">
              Sports Rehab & Joints
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              Accelerate joint recovery, reduce inflammation, and restore full range of athletic movement.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
