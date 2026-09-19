import { Link } from 'react-router-dom'
import { images } from '../assets/images'
import { Icon } from './Icon'

type FooterLink = {
  label: string
  href?: string
}

type FooterColumn = {
  heading: string
  links: FooterLink[]
}

const footerColumns: FooterColumn[] = [
  {
    heading: 'COMPANY',
    links: [
      { label: 'About H&CO.', href: '/about' },
      { label: 'Affiliate, Partnership & Influencer Program' },
      { label: 'Press Releases' },
    ],
  },
  {
    heading: 'MARKET PLACE',
    links: [
      { label: 'Electronics & Tech' },
      { label: 'Fashion & Accessories' },
      { label: 'Home & Garden' },
      { label: 'Construction & Tools' },
      { label: 'Energy & Power' },
    ],
  },
  {
    heading: 'SOURCE ON H&CO.',
    links: [
      { label: 'Trending Products' },
      { label: 'Request Quotation' },
      { label: 'Connect with Agent' },
    ],
  },
  {
    heading: 'TERMS',
    links: [
      { label: 'Warranty', href: '/warranty' },
      { label: 'Shipping & Delivery', href: '/shipping-delivery' },
      { label: 'Return & Refund Policy', href: '/return-refund' },
      { label: 'Terms & Conditions' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
  {
    heading: 'CUSTOMER SUPPORT',
    links: [
      { label: 'Live Chat' },
      { label: 'Secured Payments', href: '/secure-payments' },
      { label: 'Intellectual Property', href: '/intellectual-property' },
    ],
  },
]

const socialIcons = [
  { src: images.footer.facebook, label: 'Facebook' },
  { src: images.footer.instagram, label: 'Instagram' },
  { src: images.footer.tiktok, label: 'TikTok' },
  { src: images.footer.youtube, label: 'YouTube' },
  { src: images.footer.linkedin, label: 'LinkedIn' },
  { src: images.footer.twitter, label: 'X' },
]

const trustBadges = [
  images.footer.trust1,
  images.footer.trust2,
  images.footer.trust3,
  images.footer.trust4,
  images.footer.trust5,
]

const paymentIcons = [
  images.footer.applePay,
  images.footer.mastercard,
  images.footer.visa,
  images.footer.paypal,
  images.footer.tabby,
]

export function Footer() {
  return (
    <footer className="flex w-full flex-col">
      <div className="border border-border-primary px-4 lg:px-16">
        <div className="flex flex-col gap-14 border-x border-border-primary px-4 py-8 lg:px-6 lg:py-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <img alt="H&CO." className="size-22" src={images.footer.logo} />
            <div className="w-full lg:ml-auto lg:w-124">
              <p className="mb-2 text-base font-medium tracking-[-0.32px] text-text-primary lg:text-center">
                Stay updated with H&CO. newsletters and promotions
              </p>
              <div className="flex items-center gap-2 rounded-full border border-border-secondary bg-bg-primary p-1">
                <div className="flex min-w-0 flex-1 items-center gap-2 p-2">
                  <Icon src={images.footer.mail} />
                  <span className="min-w-0 flex-1 text-base font-medium tracking-[-0.32px] text-text-tertiary">
                    Emaill
                  </span>
                </div>
                <button type="button" className="btn-orange flex h-10 items-center rounded-full p-4">
                  <span className="text-sm font-medium tracking-[-0.28px] text-text-inverse">
                    Subscribe
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-y-6 md:gap-x-0 lg:gap-6 md:flex-row w-full md:flex-wrap lg:flex-nowrap">
            {footerColumns.map((column, index) => (
              <div key={column.heading} className="flex min-w-0 flex-col gap-4 md:w-1/3 lg:flex-1">
                <p className="text-sm font-medium tracking-[-0.28px] text-text-tertiary">
                  {column.heading}
                </p>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link
                          to={link.href}
                          className="block py-2 text-base font-medium tracking-[-0.32px] text-text-secondary hover:text-text-primary"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href="#"
                          className="block py-2 text-base font-medium tracking-[-0.32px] text-text-secondary hover:text-text-primary"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
                {index === footerColumns.length - 1 && (
                  <div className="mt-8 flex items-center gap-4 lg:gap-1 xl:gap-4 lg:mt-0">
                    {socialIcons.map((icon) => (
                      <a key={icon.label} href="#" aria-label={icon.label}>
                        <Icon src={icon.src} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-border-primary px-4 lg:px-16">
        <div className="flex flex-col gap-6 border-x border-border-primary p-4 lg:flex-row lg:items-center lg:gap-4 lg:p-6">
          <div className="flex flex-col gap-6">
            <p className="text-base font-medium tracking-[-0.32px] text-text-secondary">
              Download the H&CO. App on
            </p>
            <div className="flex items-center gap-4">
              <img alt="Download on the App Store" className="h-10 w-30" src={images.footer.appStore} />
              <img alt="Get it on Google Play" className="h-10 w-34" src={images.footer.googlePlay} />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:ml-auto lg:items-end lg:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              {trustBadges.map((badge) => (
                <img key={badge} alt="" className="h-7 object-contain" src={badge} />
              ))}
            </div>
            <div className="hidden h-7 w-px lg:block">
              <img alt="" className="size-full" src={images.footer.divider} />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3.5">
              {paymentIcons.map((icon) => (
                <img key={icon} alt="" className="h-7 w-9 object-contain" src={icon} />
              ))}
              <div className="relative h-7 w-9 overflow-hidden rounded border border-border-primary">
                <img alt="Tamara" className="size-full object-cover" src={images.footer.tamara} />
                <img
                  alt=""
                  className="absolute inset-x-[12.5%] top-[41.67%] h-[19.63%]"
                  src={images.footer.tamaraIcon}
                />
              </div>
              <div className="flex h-7 w-9 items-center justify-center rounded border border-border-primary bg-bg-primary">
                <img alt="Google Pay" className="h-[41.17%] w-[74.78%] object-contain" src={images.footer.googlePay} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border-primary px-4 lg:px-16">
        <div className="flex flex-col gap-2 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <img alt="Compliance badges" className="h-12 w-38 object-contain" src={images.footer.compliance} />
          <div className="lg:w-68 lg:text-right">
            <p className="text-sm font-medium tracking-[-0.28px] text-text-tertiary">
              Nordbær • Gridvolt • MSTEPA • Gründen
            </p>
            <p className="text-base font-medium tracking-[-0.32px] text-text-secondary">
              © 2026 H&CO. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
