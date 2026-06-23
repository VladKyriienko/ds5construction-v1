export type DescriptionBlock = {
  title: string;
  text: string;
};

export const SERVICE_BLOCK_BACKGROUNDS = [
  'default',
  'muted',
  'card',
] as const;
export type ServiceBlockBackground =
  (typeof SERVICE_BLOCK_BACKGROUNDS)[number];

export type ServiceContentBlock = {
  description: DescriptionBlock[];
  image?: string;
  imageSize?: 'small' | 'default' | 'large' | 'wide';
  imageHeight?: 'short' | 'normal' | 'wide' | 'tall';
  background?: ServiceBlockBackground;
  imageSide?: 'left' | 'right';
  layout?: 'wrap' | 'side-by-side';
  quoteButton?: boolean;
};

export type Service = {
  slug: string;
  published: boolean;
  title: string;
  shortTitle: string;
  description: DescriptionBlock[];
  image?: string;
  gallery?: string[];
  showGallery?: boolean;
  blocks?: ServiceContentBlock[];
  showQuoteInContent?: boolean;
};

export type ProjectContentBlock = ServiceContentBlock;

export type ConstructionProcessPhoto = {
  src: string;
  caption: string;
};

export type ConstructionProcessStage = {
  title: string;
  photos: ConstructionProcessPhoto[];
};

export type ConstructionProcessContent = {
  heading?: string;
  intro: string;
  stages: ConstructionProcessStage[];
  quoteButton?: boolean;
};

export type Project = {
  slug: string;
  order?: number;
  published: boolean;
  title: string;
  address?: string;
  image?: string;
  gallery: string[];
  showGallery?: boolean;
  description?: DescriptionBlock[];
  blocks?: ProjectContentBlock[];
  showQuoteInContent?: boolean;
  constructionProcess?: ConstructionProcessContent;
};

export type ProjectWithCleanDescription = Project & {
  cleanDescription: string;
};

export type TeamMember = {
  name: string;
  role: string;
  description: string;
  image: string;
};

export type ValidLucideIconName =
  | 'Award'
  | 'ArrowLeft'
  | 'Calculator'
  | 'CheckCircle2'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'ClipboardList'
  | 'Coins'
  | 'Facebook'
  | 'HelpCircle'
  | 'Home'
  | 'Instagram'
  | 'Lightbulb'
  | 'Mail'
  | 'MapPin'
  | 'Menu'
  | 'Moon'
  | 'Phone'
  | 'Quote'
  | 'ShieldCheck'
  | 'Sun'
  | 'Umbrella'
  | 'X'
  | 'Youtube';

export type WhyWorkWithUsItem = {
  title: string;
  subtitle: string;
  icon?: ValidLucideIconName;
};

export type DefaultTheme = 'light' | 'dark';

export type NavLink = {
  href: string;
  label: string;
};

export type TestimonialItem = {
  quote: string;
  author: string;
  project: string;
};

export type GoogleReviewItem = TestimonialItem;

export type MutedSectionVariant = 'default' | 'muted';
export type SectionVariant = MutedSectionVariant | 'tight';
export type WhyWorkWithUsVariant = MutedSectionVariant;

export type { ContactFormPayload } from '../lib/contact-form-validation';

export type SectionProps = {
  id?: string;
  'aria-label'?: string;
  variant?: SectionVariant;
  class?: string;
};

export type SectionGridProps = {
  class?: string;
};

export type HaveAQuestionSectionProps = {
  title?: string;
  description?: string;
  variant?: MutedSectionVariant;
  id?: string;
  class?: string;
};

export type TestimonialsProps = {
  title?: string;
  description?: string;
  items?: readonly TestimonialItem[] | TestimonialItem[];
  variant?: MutedSectionVariant;
  class?: string;
};

export type WhyWorkWithUsProps = {
  title?: string;
  subtitle?: string;
  items?:
    | readonly WhyWorkWithUsItem[]
    | WhyWorkWithUsItem[];
  variant?: WhyWorkWithUsVariant;
  class?: string;
};

export type GalleryProps = {
  images: string[];
  title: string;
  showThumbnails?: boolean;
};

export type ConstructionNavBarProps = {
  showDarkModeToggle?: boolean;
};

export type ConstructionHomeProps = {
  projects: ProjectWithCleanDescription[];
  services: Service[];
  googleReviews?: TestimonialItem[] | null;
};

export type PublicLayoutProps = {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showDarkModeToggle?: boolean;
  showFooter?: boolean;
};
