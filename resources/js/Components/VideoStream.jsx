import React, { useEffect, forwardRef } from "react";

const VideoStream = forwardRef(({ stream, ...props }, ref) => {
    useEffect(() => {
        const setStream = () => {
            try {
                if (ref?.current && stream) {
                    ref.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error setting video stream:", err);
            }
        };

        setStream();

        return () => {
            if (ref?.current) {
                ref.current.srcObject = null;
            }
        };
    }, [stream, ref]);

    return <video ref={ref} {...props} />;
});

VideoStream.displayName = "VideoStream";

export default VideoStream;
