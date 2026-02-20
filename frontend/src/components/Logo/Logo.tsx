import goldBun from '../../imgs/Gold Bun.png';
import silverBun from '../../imgs/Silver Bun.png';
import bronzeBun from '../../imgs/Bronze Bun.png';
import happyBun from '../../imgs/Happy Bun.png';
import sadBun from '../../imgs/Sad Bun.png';
import { useEffect, useState } from "react";
import './Logo.css'

const images = [
    goldBun, silverBun, bronzeBun, happyBun, sadBun
]

export const Logo: React.FC = () => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    })

    return (
        <div className="animate-bun">
            {images.map((src, i) => (
                <img key={i} src={src} alt='A dumpling wobbling left and right.' className={i === index ? "img-show" : "img-hide"} />
            ))}
        </div>
    );
};

export default Logo;