import React, { useState, useEffect } from 'react';
import { GameEngine } from '../../engine/gameEngine';
import { WEATHER_CONFIGS } from '../../engine/weatherData';
import { WeatherType } from '../../types/game';
import { Sun, CloudRain, Snowflake, Zap, RefreshCw, ChevronRight, Info } from 'lucide-react';

interface WeatherWidgetProps {
  engine: GameEngine;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ engine }) => {
  const [, setTick] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const currentWeatherType: WeatherType = engine.weather?.current || 'sunny';
  const config = WEATHER_CONFIGS[currentWeatherType];
  const timer = engine.weather?.timer || 0;
  const duration = engine.weather?.duration || 65;
  const timeRemaining = Math.max(0, Math.ceil(duration - timer));
  const progressPercent = Math.min(100, Math.max(0, (timer / duration) * 100));

  const renderIcon = (type: WeatherType) => {
    switch (type) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" style={{ animationDuration: '2.5s' }} />;
      case 'snow':
        return <Snowflake className="w-4 h-4 text-blue-300 animate-pulse" style={{ animationDuration: '3s' }} />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleCycleWeather = (e: React.MouseEvent) => {
    e.stopPropagation();
    engine.cycleNextWeather();
  };

  return (
    <div
      id="hud-weather-widget"
      className="relative select-none pointer-events-auto"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="bg-black/75 border border-white/10 hover:border-white/20 p-2 rounded-xl backdrop-blur-md shadow-xl flex flex-col gap-1.5 min-w-[140px] transition-all">
        {/* Weather Title and Icon */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="p-1 rounded-lg border border-white/10 flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${config.color}20` }}
            >
              {renderIcon(currentWeatherType)}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-200 leading-tight flex items-center gap-1">
                {config.name}
              </span>
              <span className="text-[9px] font-mono text-gray-400">
                {timeRemaining}s • Next: {engine.weather?.nextWeather ? WEATHER_CONFIGS[engine.weather.nextWeather].name.split(' ')[0] : 'Rain'}
              </span>
            </div>
          </div>

          <button
            onClick={handleCycleWeather}
            title="Cycle Next Weather Phase"
            className="p-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar towards Next Weather Cycle */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: config.color,
              boxShadow: `0 0 6px ${config.color}`,
            }}
          />
        </div>
      </div>

      {/* Hover Info Tooltip Popup */}
      {showDetails && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-gray-950/95 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-lg z-50 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              {renderIcon(currentWeatherType)}
              <span className="font-bold text-xs text-white">{config.name}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">
              Active Realm Aura
            </span>
          </div>

          <p className="text-[10px] text-gray-300 leading-relaxed italic">
            "{config.description}"
          </p>

          <div className="bg-black/50 border border-white/10 rounded-lg p-2 flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Active Weather Buffs
            </span>
            <span className="text-[10px] text-gray-200 font-medium leading-normal">
              {config.effects.statDescription}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-white/5">
            <span>Cycle duration: {duration}s</span>
            <span className="text-blue-400 flex items-center gap-0.5 cursor-pointer hover:underline" onClick={handleCycleWeather}>
              Cycle Now <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
