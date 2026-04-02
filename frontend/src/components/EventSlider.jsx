import { useRef, useState, useEffect } from 'react';
import EventCard from './EventCard';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function EventSlider({ events, title, subtitle }) {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('.slider-item')?.offsetWidth || 340;
      sliderRef.current.scrollBy({ left: -(cardWidth * 2), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('.slider-item')?.offsetWidth || 340;
      sliderRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
    }
  };

  // Drag to scroll functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftPos(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  if (!events || events.length === 0) {
    return (
      <div className="event-slider-section fade-in">
        <div className="container">
          <div className="event-slider-header">
            <div>
              <h2 className="event-slider-title" style={{ color: 'var(--text-muted)' }}>{title}</h2>
              {subtitle && <p className="event-slider-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>
            <p>Hiện tại không có sự kiện nào trong danh mục này.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-slider-section fade-in">
      <div className="container">
        <div className="event-slider-header">
          <div>
            <h2 className="event-slider-title">{title}</h2>
            {subtitle && <p className="event-slider-subtitle">{subtitle}</p>}
          </div>
          <div className="event-slider-controls">
            <button onClick={scrollLeft} className="slider-btn"><HiChevronLeft size={24} /></button>
            <button onClick={scrollRight} className="slider-btn"><HiChevronRight size={24} /></button>
          </div>
        </div>
      </div>
      
      <div 
        className={`event-slider-container ${isDragging ? 'dragging' : ''}`} 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="slider-spacer" />
        {events.map((event) => (
          <div key={event.id} className="slider-item">
            <EventCard event={event} />
          </div>
        ))}
        <div className="slider-spacer" />
      </div>
    </div>
  );
}
