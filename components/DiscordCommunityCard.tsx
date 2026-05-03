import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { BackgroundGradient } from '@/components/ui/aceternity/background-gradient';

interface DiscordCommunityCardProps {
  discordUrl?: string;
  locale?: string;
}

const translations = {
  en: {
    badge: 'Community',
    title: 'Join Our Discord Community',
    description: 'Connect with 2,500+ developers. Get real-time help, share ideas, and stay updated on the latest tutorials and best practices.',
    joinBtn: 'Join Discord Server',
    features: [
      'Real-time Q&A with experts',
      'Early access to new content',
      'Exclusive code snippets & resources',
    ],
  },
  zh: {
    badge: 'Community',
    title: 'Join Our Discord Community',
    description: 'Connect with 2,500+ developers. Get real-time help, share ideas, and stay updated on the latest tutorials and best practices.',
    joinBtn: 'Join Discord Server',
    features: [
      'Real-time Q&A with experts',
      'Early access to new content',
      'Exclusive code snippets & resources',
    ],
  },
};

export default function DiscordCommunityCard({ 
  discordUrl = 'https://discord.gg/codcompass',
  locale = 'en' 
}: DiscordCommunityCardProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <BackgroundGradient containerClassName="w-full h-full">
      <div className="h-full p-8 bg-palette-bgCard border border-white/[0.08] rounded-2xl hover:border-palette-primary transition-all duration-300">
        <div className="flex flex-col h-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary w-fit mb-6">
            <Icon name="message" size={14} />
            {t.badge}
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-bold text-white mb-3">{t.title}</h3>
          <p className="text-palette-textMuted mb-6 leading-relaxed">{t.description}</p>

          {/* Features List */}
          <ul className="space-y-3 mb-8 flex-shrink-0">
            {t.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-palette-textSecondary">
                <Icon name="check" size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Link
            href={discordUrl as any}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition-colors"
          >
            <Icon name="message" size={18} />
            {t.joinBtn}
          </Link>
        </div>
      </div>
    </BackgroundGradient>
  );
}
