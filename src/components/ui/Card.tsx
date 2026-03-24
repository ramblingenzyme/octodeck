import cardStyles from "./Card.module.css";
import { CardTop } from "../cards/CardParts";

interface CardProps {
  repo: string;
  age: string;
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ repo, age, className, children }: CardProps) => (
  <article className={`${cardStyles.card} ${className || ""}`}>
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
    <a href={href} target="_blank" rel="noreferrer">
      {prefix ? `${prefix} ` : ""}
      {children}
    </a>
  </p>
);

export const CardFooter = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <footer className={className || cardStyles.cardFooter}>{children}</footer>;
};
