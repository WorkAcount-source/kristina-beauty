"use client";

import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaRegClock, FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import { whatsappLink } from "@/lib/utils";

export function ContactSection() {
  return (
    <section id="contact" className="relative py-16 md:py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,228,230,0.4),transparent_50%)]" aria-hidden />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs tracking-[0.25em] uppercase text-rose-500 font-bold">Contact Us</span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 font-bold text-neutral-900">נשמח לשמוע ממך</h2>
          <p className="text-neutral-500 text-lg">אנחנו כאן לכל שאלה, קביעת תור או התייעצות — בכל מדיה שנוחה לך</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 max-w-5xl mx-auto items-center">
          
          {/* Details & Socials */}
          <div className="flex flex-col gap-8">
            <div className="grid sm:grid-cols-2 gap-6 bg-white/60 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <InfoItem icon={<span className="text-xl"><FaMapMarkerAlt /></span>} title="הכתובת שלנו" content="קיבוץ גניגר, סטודיו הבוטיק" />
              <InfoItem icon={<span className="text-xl"><FaPhoneAlt /></span>} title="טלפון" content="052-3060735" href="tel:0523060735" />
              <InfoItem icon={<span className="text-xl"><FaEnvelope /></span>} title='דוא"ל' content="yagudaeva09@gmail.com" href="mailto:yagudaeva09@gmail.com" />
              <InfoItem icon={<span className="text-xl"><FaRegClock /></span>} title="שעות פעילות" content="א'-ה': 08:00 - 16:00 | ו': 08:00 - 14:00" />
            </div>

            <div className="flex flex-col gap-6 px-2">
              <a href={whatsappLink("972523060735", "שלום, אשמח לקבל פרטים")} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20b858] text-white py-4 md:py-5 rounded-2xl font-bold text-lg shadow-lg shadow-[#25D366]/30 transition-all hover:-translate-y-1">
                <span className="text-3xl"><FaWhatsapp /></span> שלחי לנו הודעה ב-WhatsApp
              </a>
              
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <SocialButton 
                  icon={<span className="text-2xl text-white"><FaInstagram /></span>} 
                  href="https://www.instagram.com/kristina_place_of_beauty/" 
                  label="Instagram" 
                  bgClass="bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]" 
                />
                <SocialButton 
                  icon={<span className="text-2xl text-white"><FaFacebookF /></span>} 
                  href="https://facebook.com/" 
                  label="Facebook" 
                  bgClass="bg-[#1877F2]" 
                />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-100 transform transition-transform hover:scale-[1.01] duration-500">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13481.56453775053!2d35.2505502!3d32.688849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c4fa4891b29b9%3A0xc3fe4e1a067ed771!2sGinegar!5e0!3m2!1sen!2sil!4v1709999999999!5m2!1sen!2sil" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[10%] contrast-125 hover:grayscale-0 transition-all duration-700"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

function InfoItem({ icon, title, content, href }: { icon: React.ReactNode; title: string; content: string; href?: string }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper href={href} className={`flex gap-4 items-start ${href ? 'hover:opacity-75 transition-opacity' : ''}`}>
      <div className="size-10 rounded-full bg-rose-50 text-rose-600 flex flex-shrink-0 items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-neutral-900 mb-0.5">{title}</div>
        <div className="text-sm text-neutral-600 leading-tight">{content}</div>
      </div>
    </Wrapper>
  );
}

function SocialButton({ icon, href, label, bgClass }: { icon: React.ReactNode; href: string; label: string; bgClass: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      aria-label={label}
      className={`size-12 rounded-full flex items-center justify-center transition-all duration-300 ${bgClass} hover:-translate-y-1 shadow-md hover:shadow-lg`}
    >
      {icon}
    </a>
  );
}
