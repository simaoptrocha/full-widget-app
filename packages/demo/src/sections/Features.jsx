import { useEffect } from 'react';
import { Element } from 'react-scroll';
import { loadCustomWidget } from 'sdk'; // Import your custom widget loader
// import { loadCustomWidget } from "../../../sdk/index.js";

const Features = () => {
  useEffect(() => {
    const initializeCustomWidget = async () => {
      try {
        console.log('Loading custom widget script...');
        const customWidgetLoader = await loadCustomWidget();
        
        const widgetInstance = customWidgetLoader({
          variant: 'embedded',
          containerNodeSelector: '#widget-container',
          // walletAddress: '0x5DD7F5Ea7243e921f971C4044048E829b44cAdaf',
          chain: 1,
          token: 'usdc'
          // options: {
          //   text: {
          //     introTitle: "Intro main title example",
          //     introDescription: "Description text example goes here",
          //     introButtonTitle: "Intro button Title",
          //     introAdditionalText: "Additional text goes here!"
          //   },
          //   styles: { backgroundColor: 'black', color: 'white' }
          // }
        });

        console.log('Showing custom widget...');
        widgetInstance.show();
      } catch (error) {
        console.error('Failed to initialize custom widget:', error);
      }
    };
    initializeCustomWidget();
  }, []);

  return (
    <section>
      <Element name="features">
        <div
          className="flex justify-center items-center w-full sm:w-4/5"
          style={{
            height: '700px',
            borderRadius: '10px',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          <div
            id="widget-container"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          ></div>
        </div>
      </Element>
    </section>
  );
};

export default Features;
