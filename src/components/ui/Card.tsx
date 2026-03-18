import cardStyles from '../cards/Card.module.css';

interface CardTopProps {
  repo: string;
  age: string;
}

const CardTop = ({ repo, age }: CardTopProps) => (
  <header className={cardStyles.cardTop}>
    <span className={cardStyles.cardRepo}>{repo}</span>
    <time className={cardStyles.cardAge}>{age}</time>
  </header>
);

interface CardProps {
  repo: string;
  age: string;
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ repo, age, className, children }: CardProps) => (
  <article className={`${cardStyles.card}${className ? ` ${className}` : ''}`}>
    <CardTop repo={repo} age={age} />
    {children}
  </article>
);

interface CardTitleProps {
  href: string;
  prefix?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ href, prefix, children }: CardTitleProps) => (
  <p className={cardStyles.cardTitle}>
    <a href={href} target="_blank" rel="noreferrer" className={cardStyles.cardTitleLink}>
      {prefix ? `${prefix} ` : ''}{children}
    </a>
  </p>
);

export const CardMeta = ({ children }: { children: React.ReactNode }) => (
  <footer className={cardStyles.cardMeta}>{children}</footer>
);

export const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <footer className={cardStyles.cardFooter}>{children}</footer>
);
