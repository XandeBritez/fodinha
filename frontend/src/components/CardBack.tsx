import './CardBack.css';

interface CardBackProps {
  size?: 'small' | 'medium' | 'large';
}

export function CardBack({ size = 'medium' }: CardBackProps) {
  return (
    <div className={`card-back ${size}`}>
      <div className="card-back-pattern"></div>
    </div>
  );
}
