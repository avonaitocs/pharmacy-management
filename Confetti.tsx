
import React, { useEffect, useState } from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-2 h-4" style={style}></div>
);

interface ConfettiProps {
  onComplete: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const colors = ['#00A8E8', '#FBBF24', '#F87171', '#34D399', '#A78BFA'];
        const newPieces = Array.from({ length: 150 }).map((_, i) => {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                top: `${-20 - Math.random() * 100}px`,
                backgroundColor: colors[i % colors.length],
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${2 + Math.random() * 3}s ${Math.random() * 2}s linear forwards`,
            };
            return <ConfettiPiece key={i} style={style} />;
        });
        setPieces(newPieces);

        const timer = setTimeout(onComplete, 5000); // Clean up after 5 seconds

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <style>
                {`
                    @keyframes fall {
                        to {
                            transform: translateY(100vh) rotate(720deg);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            {pieces}
        </div>
    );
};

export default Confetti;
