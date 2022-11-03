// https://stackoverflow.com/a/61602724/3903374
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}