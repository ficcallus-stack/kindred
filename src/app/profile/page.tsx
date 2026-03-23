import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function Profile() {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "Mother of two • Brooklyn",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXWtBQrv4ZMmGmjCMbYxL9C6Genq3Fgc9MsVguHLZE-Jm_OpcWtpryejAM1WnshYNH1O9ONOmeQi-si5Kjy05I3Jj5Ys-BRC5W3EUxnixdx4lM5zAUQox55BT7TWuRimg3fbdbpl5hNjYbodDMC8yg1R-PYBPUE116ISftHCOQy-Qx5qzX6TtSJhg3Uw-XwV6Ok8ptQkAuIKwk985O-XSM9BA9PN_Oe6Is4k8wSK3i28gJmp1tM0Whn67RKCKQ34w3bAmFshQ8RGE",
      content: "\"Elena has been with our family for nearly 3 years. She is truly a part of the family. Her patience and ability to engage with my energetic toddlers is unmatched. We feel so safe leaving our boys in her care.\""
    },
    {
      name: "Michael Chen",
      role: "Parent • Park Slope",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkR0cRFlA39VDL6-rnyf6A0fPlH5uw7C_5XHaC-KG8sb_k2TdEpLnJbhSualRmw7VMLOk3Tsmdbv2pOEss1tWQtbAVSkzCy0FUHHzxWu1ZehjNC-sBFtE9mBYQ4sUAfdMhXY_F9bg2QuMw-aqsMlEC0oYATyADVd74TOrEAKUr_6h0WHK-zl29GCmQ52iFcF9XLHyIvM0UjK70rwqzLgKZgGjTXGHhBYSjEsh2Xm03URAL9DEy4Hyoq2H8mYUqOCGDWJw41aJYN-w",
      content: "\"Highly recommend Elena for infant care. She helped us tremendously with sleep training our 6-month-old. She's professional, punctual, and very knowledgeable about development.\""
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-20">
        <section className="relative bg-surface-container-low py-16 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] bg-surface-container-highest rounded-tl-[3rem] rounded-br-[3rem] overflow-hidden shadow-2xl relative z-10">
                <img
                  alt="Elena Rodriguez Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl1veN8YO7Jg5YYpUQ9bjQKcaZaXd_156yMpyDgTiNJhY6LoSUXp7XBynB8GIPo7qFfh1VL9g1gIuDy4ZP0IjDSCJFHC6SDDnQzZKZfRxQmz7gMgSIqzJn76pbmuqcLZUVeMB7EjXfZXfl3Oz3gHBfQWOIWjKRJo5O5LVoPYoy3Ex0lCoVG-iIPRDk7zE2Af2JVXaRiqfFFSxU8EisnRXNg_y58c--v611Vc2i_X2e9d7JzO4dTLqp-LpM2aeh301hitiHu_fT0F0"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-fixed-dim rounded-full -z-0 opacity-50"></div>
            </div>
            <div className="lg:col-span-7 pb-8">
              <div className="flex flex-col space-y-4">
                <div className="inline-flex items-center space-x-2 text-primary font-semibold tracking-wider uppercase text-xs">
                  <MaterialIcon name="verified" className="text-sm" fill />
                  <span>Premium Verified Caregiver</span>
                </div>
                <h1 className="text-5xl font-extrabold text-primary font-headline leading-tight">
                  Elena Rodriguez, 29
                </h1>
                <p className="text-xl text-on-surface-variant flex items-center">
                  <MaterialIcon name="location_on" className="mr-2" />
                  Brooklyn, NY • 8 Years Experience
                </p>
                <div className="flex flex-wrap gap-4 pt-6">
                  <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
                    <MaterialIcon name="mail" />
                    Message Elena
                  </button>
                  <button className="bg-secondary-fixed-dim text-on-secondary-fixed px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                    <MaterialIcon name="calendar_today" />
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6">
                <h3 className="font-headline font-bold text-xl text-primary">Verification Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-tertiary-fixed/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="check_circle" className="text-on-tertiary-fixed-variant" fill />
                      <span className="font-medium">Identity Verified</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">Gov. ID</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-tertiary-fixed/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="history" className="text-on-tertiary-fixed-variant" fill />
                      <span className="font-medium">Background Check</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">Nov 2023</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-tertiary-fixed/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="groups" className="text-on-tertiary-fixed-variant" fill />
                      <span className="font-medium">References (4)</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">All Positive</span>
                  </div>
                </div>
              </div>
              <div className="relative group cursor-pointer overflow-hidden rounded-xl aspect-video bg-primary-container flex items-center justify-center">
                <img
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAqrmko8O-m69pQNPioaBm91N4oBZToBv_lCJFdq2BO-NZkm0gKOluSf71cFsP9Foy0K6cDEFArzS9b18ps-MRLsq_Fl03dakbnYTTV3bjPMFFi8YPiLPMMrZNotGEnZ_fp8MHh7QwtpB_lTES9Hk39b0ts_uTEggwuvNfY9zNC-wD2C2D03Jw3Qqsxpl70GEhFrdEmE_ek9KKp-R3URPfiFIp9l1ZWWNFbV2nTMnD_TV8NjCPS1hFUZ3z0U0xlBrqpB0JNvLZ0Dc"
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <MaterialIcon name="play_arrow" className="text-white text-4xl" fill />
                  </div>
                  <span className="text-white font-bold tracking-wide">Watch Introduction</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <h2 className="font-headline font-bold text-3xl text-primary">About Me</h2>
                <div className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed text-lg">
                  <p>
                    Hello! I'm Elena, a dedicated and passionate caregiver with over 8 years of experience working with infants and toddlers. I believe that every child deserves a nurturing environment where they can feel safe to explore their world.
                  </p>
                  <p className="mt-4">
                    My background is in Early Childhood Education, and I specialize in developmental milestones, sleep training, and bilingual enrichment. I'm originally from Spain and love incorporating Spanish language and culture into daily play and learning.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="font-headline font-bold text-2xl text-primary">Skills & Certifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: "child_care", label: "Infant Care" },
                    { icon: "medical_services", label: "CPR Certified" },
                    { icon: "translate", label: "Bilingual (ES/EN)" },
                    { icon: "bedtime", label: "Sleep Training" },
                    { icon: "kitchen", label: "Organic Prep" },
                    { icon: "diversity_1", label: "Multiples Exp." },
                  ].map((skill) => (
                    <div key={skill.label} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                      <MaterialIcon name={skill.icon} className="text-primary" />
                      <span className="text-sm font-semibold">{skill.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="font-headline font-bold text-3xl text-primary mb-2">Weekly Availability</h2>
                <p className="text-on-surface-variant">Last updated: Today at 9:00 AM</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary-container rounded-sm"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-surface-variant rounded-sm"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr>
                    <th className="p-4 text-left font-headline font-bold text-primary">Time</th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <th key={day} className="p-4 text-center font-bold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: "Mornings", availability: [true, true, true, false, true, false, false] },
                    { time: "Afternoons", availability: [true, true, true, true, true, false, false] },
                    { time: "Evenings", availability: [false, false, false, false, false, true, true] },
                  ].map((row) => (
                    <tr key={row.time}>
                      <td className="p-4 font-semibold text-sm">{row.time}</td>
                      {row.availability.map((isAvailable, i) => (
                        <td
                          key={i}
                          className={cn(
                            "p-4 rounded-xl",
                            isAvailable ? "bg-secondary-container" : "bg-surface-variant opacity-40"
                          )}
                        ></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="mb-12">
            <h2 className="font-headline font-bold text-3xl text-primary mb-2">Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex text-secondary-container">
                {[1, 2, 3, 4, 5].map((s) => (
                  <MaterialIcon key={s} name="star" fill />
                ))}
              </div>
              <span className="font-bold text-xl">5.0</span>
              <span className="text-on-surface-variant">(42 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.name} className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                    <img alt={review.name} className="w-full h-full object-cover" src={review.image} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{review.name}</h4>
                    <p className="text-xs text-on-surface-variant italic">{review.role}</p>
                  </div>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
