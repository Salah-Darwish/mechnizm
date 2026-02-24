import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store";
import "./MarqueeBanner.css";
import type { Marquee } from "../../types/marquee";

interface MarqueeItem {
  id: number;
  text: string;
  position: number;
}

const MarqueeBanner = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  // Read marquees from redux store so admin updates reflect immediately
  const marqueeTexts = useSelector(
    (state: RootState) => state.marquee.marquees
  ) as Marquee[];
  const [loading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [totalWidth, setTotalWidth] = useState(0);
  const animationRef = useRef<number | null>(null);
  const speedRef = useRef(1); // pixels per frame

  // Get the text based on current language
  const getMarqueeText = useCallback((marquee: Marquee) => {
    return isArabic ? marquee.text_ar : marquee.text_en;
  }, [isArabic]);

  // No local fetch here — component reads from store which is updated by admin actions or API sync elsewhere.

  // Measure item widths and initialize positions when texts are loaded
  useEffect(() => {
    if (!marqueeTexts || marqueeTexts.length === 0) return;

    // Sort marquees by updatedAt (or keep original order if available)
    const sortedMarquees = [...marqueeTexts].sort((a, b) => {
      const ta = new Date(a.updatedAt).getTime();
      const tb = new Date(b.updatedAt).getTime();
      return ta - tb;
    });

    // Measure width of each individual marquee text + bullet
    const widths: number[] = [];
    let total = 0;

    sortedMarquees.forEach((marquee) => {
      const measureElement = document.createElement("span");
      measureElement.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;font-size:14px;font-weight:600;";
      measureElement.innerHTML = `${getMarqueeText(marquee)}<span style="margin:0 48px">•</span>`;
      document.body.appendChild(measureElement);
      const width = measureElement.offsetWidth;
      document.body.removeChild(measureElement);
      widths.push(width);
      total += width;
    });

    setItemWidths(widths);
    setTotalWidth(total);

    // Create initial items - position each marquee text sequentially
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;
    const setsNeeded = Math.ceil(containerWidth / total) + 2;

    const initialItems: MarqueeItem[] = [];
    let currentPosition = 0;
    let itemId = 0;

    for (let set = 0; set < setsNeeded; set++) {
      sortedMarquees.forEach((marquee, idx) => {
        initialItems.push({
          id: itemId++,
          text: getMarqueeText(marquee),
          position: currentPosition,
        });
        currentPosition += widths[idx];
      });
    }

    setItems(initialItems);
  }, [marqueeTexts, isArabic, getMarqueeText]);

  // Animation loop - circular buffer logic
  useEffect(() => {
    if (totalWidth === 0 || items.length === 0 || itemWidths.length === 0)
      return;

    const sortedMarquees = [...marqueeTexts].sort((a, b) => {
      const ta = new Date(a.updatedAt).getTime();
      const tb = new Date(b.updatedAt).getTime();
      return ta - tb;
    });
    const numTexts = sortedMarquees.length;

    const animate = () => {
      setItems((prevItems) => {
        return prevItems.map((item, index) => {
          const textIndex = index % numTexts;
          const width = itemWidths[textIndex];
          let newPosition = item.position - speedRef.current;

          // If item moves completely off the left edge, wrap it to the right
          if (newPosition < -width) {
            const maxPosition = Math.max(...prevItems.map((i) => i.position));
            newPosition =
              maxPosition +
              itemWidths[
                prevItems.findIndex((i) => i.position === maxPosition) %
                  numTexts
              ];
          }

          return {
            ...item,
            position: newPosition,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalWidth, items.length, itemWidths, marqueeTexts]);

  // Don't render until data is loaded
  if (loading || marqueeTexts.length === 0) {
    return (
      <div
        className="marquee-wrapper py-2"
        style={{ backgroundColor: "#c4886a" }}
      >
        <div className="h-6"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="marquee-wrapper py-2"
      style={{ backgroundColor: "#c4886a" }}
    >
      <div className="marquee-track-js">
        {items.map((item) => (
          <div
            key={item.id}
            className="marquee-item"
            style={{
              transform: `translateX(${item.position}px) translateY(-50%)`,
            }}
          >
            <span className="text-sm md:text-base font-semibold text-white whitespace-nowrap">
              {item.text}
            </span>
            <span
              className="text-white/80 whitespace-nowrap"
              style={{ margin: "0 48px" }}
            >
              •
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
