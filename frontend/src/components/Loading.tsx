import { Dosis } from "next/font/google";
import { FC } from "react";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

const Loading: FC = ({}) => {
  return (
    <div
      className={`${dosis.variable} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="font-dosis text-gray-600 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;
