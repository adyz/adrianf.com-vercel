import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'
import useSound from 'use-sound';


import Logo from "./Logo";
import Switch from "./Switch";
import SwitchBase from "./SwitchBase";
import soundToggle from "../../sounds/switch.wav"
import { COLOR_MODE_KEY } from '~/constants';
import type { TColorMode } from '~/constants';
import { setCookie } from '~/utils/cookie';
import { useLoaderData, useTransition, useLocation, Link } from '@remix-run/react';

function replaceAll(originalString: string, find: string, replace: string) {
  return originalString.replace(new RegExp(find, 'g'), replace);
};


const darkVars = `
  --colorBorder: #3a3a30;
  --colorBrown: #F5EFB9;
  --colorLightBrown: #9F9C7D;
  --colorLigherBrown: #716E59;
  --colorSuperLigherBrown: #525040;
  --colorBg: #434238;
  --colorRed: #9F9C7D;
  --colorGreen: #52870f;
  --colorWhite: #28281F;
  --colorLogoBody: #6FA68C;
  --colorLogoLeg: #216155;
  --colorLogoWing: #74CCA2;
`

const lightVars = `
  --colorBorder: #eeebd8;
  --colorBrown: #543416;
  --colorLightBrown: #865E5E;
  --colorLigherBrown: #AEA092;
  --colorSuperLigherBrown: #E7D7C8;
  --colorBg: #fffdef;
  --colorRed: #e95d5d;
  --colorGreen: #52870f;
  --colorWhite: #ffffff;
  --colorLogoBody: #6FA68C;
  --colorLogoLeg: #216155;
  --colorLogoWing: #74CCA2;
`

const Header = () => {

  const loaderData = useLoaderData();
  const transition = useTransition();

  const location = useLocation();
  const pathName = replaceAll(location.pathname, '/', '');

  const [isSticky, setSticky] = useState(typeof window !== 'undefined' ? window.scrollY > 0 ? true : false : false);
  const [colorMode, setColorMode] = useState<TColorMode>(loaderData?.colorMode ? loaderData.colorMode : 'unset');
  const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
  const [toggled, setToggled] = useState(false);
  const [playToggleSound] = useSound(soundToggle, { volume: 0.1 });


  // Set the drag hook and define component movement based on gesture data
  const bind = useGesture({
    onDrag: function Dragging(state) {
      const { down, movement: [mx, my] } = state;
      set({ y: down && my < 250 ? my : 0 })
      if (down && my > 50 && !toggled) {
        setToggled(true);
        toggle();
      }
    },
    onDragEnd: function DragEnd() {
      setToggled(false);
    },
    onMouseDown: () => console.log('mouse down')
  })
  useEffect(() => {
    //Sticky header
    window.addEventListener('scroll', handleScroll);
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    prefersDarkScheme.addListener(setThemeFuncForUserPrefEvent);
    return () => {
      window.removeEventListener('scroll', () => handleScroll);
      prefersDarkScheme.removeListener(setThemeFuncForUserPrefEvent);
    };
  }, []);

  if (!colorMode) {
    return null;
  }

  function setThemeFuncForUserPrefEvent(e: any) {
    if (e.matches) {
      setColorMode('dark')
    } else {
      setColorMode('light')
    }
  }

  const handleScroll = () => {
    setSticky(document.body.getBoundingClientRect().top < -2);
  };

  function toggle() {
    console.log('Toggle');
    playToggleSound();


    if (colorMode === 'unset') {
      console.log('color mode unset')
      const { matches: prefersDarkScheme } = window?.matchMedia("(prefers-color-scheme: dark)");
      console.log('color mode unset', prefersDarkScheme)
      if (prefersDarkScheme) {
        console.log('Has dark, will switch to ligt')
        setColorMode('light');
        setCookie(COLOR_MODE_KEY, 'light', 360);
      } else {
        console.log('Has light, will switch to dark')
        setColorMode('dark');
        setCookie(COLOR_MODE_KEY, 'dark', 360);
      }
    }

    if (colorMode === 'dark') {
      setColorMode('light');
      setCookie(COLOR_MODE_KEY, 'light', 360);
    }

    if (colorMode === 'light') {
      setColorMode('dark');
      setCookie(COLOR_MODE_KEY, 'dark', 360);
    }
  }

  const linkStyle = { transition: 'opacity .2s ease', opacity: transition.state === 'loading' ? '0.4' : '1' }


  const NAV_LINKS = [{
    label: 'Tech Stack',
    link: 'tech-stack'
  },
  {
    label: 'Experience',
    link: 'experience'
  },
  {
    label: 'Thoughts',
    link: 'thoughts'
  },
  {
    label: 'Contact',
    link: 'contact'
  }]


  function LinkItem({ label, link }: { label: string; link: string }) {
    return (
      <Link
        style={linkStyle}
        prefetch="intent"
        className={`
              text-xs sm:text-base lg:text-lg 2xl:text-xl
              text-colorBrown
              tracking-wider
              no-underline 
              py-2 
              px-1.5 sm:px-2 lg:px-6
              rounded-md
              border border-transparent border-solid
              text-center
              flex
              items-center
              hover:bg-colorBorder
              active:bg-colorSuperLigherBrown
              ${(pathName === link || pathName.startsWith(link)) && 'bg-colorBorder'}
            `}
        to={link}
      >
        {label}
      </Link>
    )
  }

  return (
    <>

      {colorMode === 'unset' && (
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              :root {
                ${darkVars}
              }
            }
            
            @media (prefers-color-scheme: light) {
              :root {
                ${lightVars}
              }
            }
            `}
        </style>
      )}

      {colorMode === 'light' && (
        <style>
          {`
            :root {
              ${lightVars}
            }
          `}
        </style>
      )}

      {colorMode === 'dark' && (
        <style>
          {`
          :root {
            ${darkVars}
          }
        `}
        </style>
      )}

      <header className={`
        fixed z-40 bg-colorBg
        flex items-center
        w-full
        h-62px
        justify-between
        py-1 md:py-2
        px-2 md:px-8  
        ${isSticky ? ' shadow-md' : 'shadow-sm'}
      `}>
        <Link
          style={linkStyle}
          prefetch="intent"
          className={`
              h-10 md:h-12
              w-12 md:w-20 
              flex rounded-lg 
              justify-center items-center 
              p-0.5 md:p-3
              overflow-hidden
              hover:bg-colorBorder
              active:bg-colorSuperLigherBrown

              ${pathName === '' && 'bg-colorBorder'}`
          }
          title={'Home Link'} to="/"
        >
          <Logo />
        </Link>
        <nav className="flex gap-1">
          {NAV_LINKS.map((currentItem) => {
            return <LinkItem {...currentItem} key={currentItem.link} />
          })}
        </nav>
      </header>

      <div className="
        absolute
        z-20
        top-[-210px] sm:top-[-200px] md:top-[-190px]
        left-8 md:left-[4.5rem]
        flex
        justify-center
        
      ">
        <animated.div
            className="
              absolute
              -top-12
              w-10
              pb-5
              flex
              items-center
              justify-center
              drop-shadow-left-shadow
            " 
            {...bind()} 
            style={{ 
              willChange: 'transform',
              cursor: 'grab',
              touchAction: 'none',
              transform: y ? y.to((y) => `translate3d(0px,${y}px,0)`) : undefined 
            }}
          >
          <Switch />
        </animated.div>

        <div className="absolute">
          <SwitchBase />
        </div>

      </div>

    </>
  )
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
