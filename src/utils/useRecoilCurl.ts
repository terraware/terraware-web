import React from "react";
import { RecoilState, useRecoilState } from "recoil";

export default (requestIdAtom: RecoilState<number>): number | undefined => {
  const [requestId, setRequestId] = useRecoilState(requestIdAtom);
  const requestIdRef = React.useRef(requestId);

  React.useEffect(() => {
    setRequestId(requestId + 1);
  }, []);

  return requestIdRef.current !== requestId ? requestId : undefined;
}