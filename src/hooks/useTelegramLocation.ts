import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramLocation(defaultLocation: [number, number]) {
  const [position, setPosition] = useState<[number, number]>(defaultLocation);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let watchId: number;

    const fallbackToBrowserGeolocation = () => {
      console.log('Falling back to HTML5 Geolocation');
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setPosition([pos.coords.latitude, pos.coords.longitude]);
            setIsLoading(false);
          },
          (err) => {
            setError(err.message);
            setIsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setError('Geolocation not supported');
        setIsLoading(false);
      }
    };

    try {
      // 2026 Telegram WebApp LocationManager API integration
      if (WebApp && (WebApp as any).LocationManager) {
        const locationManager = (WebApp as any).LocationManager;
        
        if (!locationManager.isInited) {
          locationManager.init(() => {
            console.log('LocationManager initialized');
            if (locationManager.isLocationAvailable) {
              locationManager.getLocation((loc: any) => {
                if (loc) {
                  setPosition([loc.latitude, loc.longitude]);
                  setIsLoading(false);
                } else {
                  fallbackToBrowserGeolocation();
                }
              });
            } else {
              fallbackToBrowserGeolocation();
            }
          });
        } else {
           if (locationManager.isLocationAvailable) {
              locationManager.getLocation((loc: any) => {
                if (loc) {
                  setPosition([loc.latitude, loc.longitude]);
                  setIsLoading(false);
                } else {
                  fallbackToBrowserGeolocation();
                }
              });
           } else {
             fallbackToBrowserGeolocation();
           }
        }
      } else {
        console.warn('LocationManager not found in Telegram WebApp SDK');
        fallbackToBrowserGeolocation();
      }
    } catch (e: any) {
      console.error('Error getting Telegram location:', e);
      fallbackToBrowserGeolocation();
    }

    return () => {
      if (watchId !== undefined && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { position, error, isLoading, setPosition };
}
