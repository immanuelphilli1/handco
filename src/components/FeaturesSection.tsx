import { images } from '../assets/images'
import { Icon } from './Icon'

const features = [
  {
    title: 'Fast delivery',
    subtitle: '2-day Shipping available',
    icon: images.features.delivery,
    bgClass: 'bg-orange-light',
  },
  {
    title: 'Quality Assured',
    subtitle: '30-days Returns',
    icon: images.features.quality,
    bgClass: 'bg-red-light',
  },
  {
    title: '24/7 Support',
    subtitle: 'Dedicated trade desk',
    icon: images.features.support,
    bgClass: 'bg-green-light',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-b border-border-primary px-4 lg:px-16">
      <div className="flex flex-col gap-2 py-4 lg:flex-row lg:gap-6 lg:py-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`flex items-center gap-4 overflow-hidden rounded-[12px] px-6 py-6 lg:flex-1 lg:px-8 ${feature.bgClass}`}
          >
            <Icon src={feature.icon} className="size-12 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xl font-semibold tracking-[-0.4px] text-text-secondary">
                {feature.title}
              </p>
              <p className="text-base font-medium tracking-[-0.32px] text-text-secondary">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
