import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { ArtImage } from '../components/ui/ArtImage'
import { LinkButton } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'

export function About() {
  useSeo({
    title: 'About Valerius — Our Approach',
    description: 'Valerius is a menswear house built on considered essentials: honest fabric, limited runs, and garments that earn their place.',
    path: '/about',
  })
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <p className="eyebrow text-bronze">About Valerius</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-light leading-tight md:text-6xl">
          Fewer, better decisions — made into clothing.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Valerius exists because most menswear asks you to choose between quality and design, or between both and a
          sane price. We design a small number of pieces, obsess over their cloth and cut, and produce them in limited
          runs close to home.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal-img">
            <ArtImage seed="about-studio" label="Valerius design studio" className="aspect-[4/5] w-full" />
          </div>
          <div className="space-y-10 lg:pt-8">
            {[
              {
                title: 'Design approach',
                copy: 'We start with behaviour, not trends. How is the garment actually worn — commuted in, washed often, layered in humidity? Every pattern is adjusted until the answer is yes to all three.',
              },
              {
                title: 'Quality & materials',
                copy: 'Fabric is specified by weight and behaviour: 240 gsm jerseys, 480 gsm loopback fleece, garment-washed linen. Construction details — bar tacks, twin-needle hems, reinforced collars — are chosen for year five, not day one.',
              },
              {
                title: 'Our perspective',
                copy: 'We design for the climate and rhythm of South Asian cities first. That means breathable weights, colours that survive grey weeks, and silhouettes that work without air conditioning or a car.',
              },
              {
                title: 'Where we are going',
                copy: 'Deeper fabric development, a wider essentials range, and slower, better production. The goal is not more products — it is fewer, truer ones.',
              },
            ].map((block) => (
              <div key={block.title} className="reveal border-t border-ink pt-5">
                <h2 className="font-display text-2xl">{block.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{block.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night py-20 text-bone">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <SectionHeading
            align="center"
            eyebrow="The Standard"
            title="Does it earn its place?"
            copy="Every Valerius garment must pass one question. If a piece cannot justify its cloth, its cut, and its place in a twelve-piece wardrobe, it is not made."
          />
          <div className="reveal mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton to="/shop" variant="light">Shop the Collection</LinkButton>
            <Link to="/editorial" className="eyebrow self-center px-4 text-bone/80 underline-offset-4 hover:underline">Read the Journal</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
