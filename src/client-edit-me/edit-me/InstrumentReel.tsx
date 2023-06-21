/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { Instrument, InstrumentSymbol } from "../../common-leave-me";
import { InstrumentSocketClient } from "./InstrumentSocketClient";
import "./InstrumentReel.css";

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();

/**
 * ❌ Please do not edit this hook name & args
 */
function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    client.open(() => setIsOpen(true));

    if (isOpen) {
      const subscription = client.listen(instrumentSymbols, setInstruments);
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen]);

  return instruments;
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReel({ instrumentSymbols }: InstrumentReelProps) {
  /**
   * ❌ Please do not edit this
   */
  const instruments = useInstruments(instrumentSymbols);

  /**
   * ✅ You can edit from here down in this component.
   * Please feel free to add more components to this file or other files if you want to.
   */

  const symbolId = useMemo(
    () => instrumentSymbols.reduce((prev, curr) => `${prev}${curr}`, ""),
    []
  );

  const [difference, setDifference] = useState(0);

  useEffect(() => {
    if (instruments.length !== 0) {
      const container = document.getElementById(symbolId);

      if (container) {
        const parentWidth = container.parentElement?.clientWidth || 0;
        let difference = Math.ceil(parentWidth / container.scrollWidth);
        if (difference > 1) {
          difference *= 2;
          difference += 1;
        }

        setDifference(difference);
      }
    }
  }, [instruments.length]);

  return (
    <div className="container" id={symbolId}>
      <div className="reel animated">
        <div className="reel">
          {instruments.map((instrument) => (
            <InstrumentComponent
              key={`${instrument.code}`}
              instrument={instrument}
            />
          ))}
        </div>
        {Array(difference)
          .fill(null)
          .map((_, index) => (
            <div className="reel" key={`reel-${index}`}>
              {instruments.map((instrument) => (
                <InstrumentComponent
                  key={`${instrument.code}-${index}`}
                  instrument={instrument}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

const InstrumentComponent: React.FC<{ instrument: Instrument }> = ({
  instrument: { category, code, lastQuote, name },
}) => {
  const [updatedQuote, setUpdatedQuote] = useState({
    lastQuote,
    difference: "0",
  });

  useEffect(() => {
    const difference = (updatedQuote.lastQuote / lastQuote - 1).toFixed(4);

    setUpdatedQuote({
      difference,
      lastQuote,
    });
  }, [lastQuote]);

  const getColor = useCallback((difference: number) => {
    if (difference > 0) {
      return "lime";
    } else if (difference < 0) {
      return "red";
    } else {
      return "white";
    }
  }, []);

  const getImage = useCallback(() => {
    if (code === "EURUSD") {
      return (
        <>
          <img className="image" src={`/${category}/USD.svg`} alt="USD" />
          <img className="image" src={`/${category}/EUR.svg`} alt="EUR" />
        </>
      );
    }

    return (
      <img className="image" src={`/${category}/${code}.svg`} alt={code} />
    );
  }, [category, code]);

  return (
    <div className="instrument">
      {getImage()}
      <div>{name}</div>
      <div>{lastQuote.toFixed(1)}</div>
      <div style={{ color: getColor(Number(updatedQuote.difference)) }}>
        {updatedQuote.difference}%
      </div>
    </div>
  );
};

export default React.memo(InstrumentReel);
