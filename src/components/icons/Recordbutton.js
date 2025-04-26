import * as React from "react";

const SvgRecordbutton = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={123} height={123} {...props}>
    <defs>
      <linearGradient
        id="Recordbutton_svg__b"
        x1={0.239}
        x2={0.5}
        y1={0.096}
        y2={0.7}
        gradientUnits="objectBoundingBox"
      >
        <stop offset={0} stopColor="#e68c78" />
        <stop offset={1} stopColor="#872488" />
      </linearGradient>
      <filter
        id="Recordbutton_svg__a"
        width={123}
        height={123}
        x={0}
        y={0}
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy={8} />
        <feGaussianBlur result="blur" stdDeviation={8} />
        <feFlood floodOpacity={0.329} />
        <feComposite in2="blur" operator="in" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g data-name="Group 13">
      <g
        data-name="Group 2"
        filter="url(#Recordbutton_svg__a)"
        transform="translate(-.002 -.002)"
      >
        <g
          fill="url(#Recordbutton_svg__b)"
          stroke="#c19e9e"
          strokeWidth={0.5}
          data-name="Ellipse 1"
          opacity={0.488}
          transform="translate(24 16)"
        >
          <circle cx={37.5} cy={37.5} r={37.5} stroke="none" />
          <circle cx={37.5} cy={37.5} r={37.25} fill="none" />
        </g>
      </g>
      <g data-name="Group 7">
        <g data-name="Group 4">
          <g data-name="Group 3">
            <path
              fill="#343434"
              d="M72.217 53.533a1.174 1.174 0 1 0-2.348 0 8.3 8.3 0 1 1-16.593 0 1.174 1.174 0 1 0-2.348 0 10.757 10.757 0 0 0 9.47 10.782v3.183h-4.265a1.194 1.194 0 0 0 0 2.387h10.879a1.194 1.194 0 0 0 0-2.387h-4.266v-3.183a10.757 10.757 0 0 0 9.471-10.782"
              data-name="Path 1"
            />
          </g>
        </g>
        <g data-name="Group 6">
          <g data-name="Group 5">
            <path
              fill="#343434"
              d="M61.572 36.622a6.656 6.656 0 0 0-6.64 6.644v10.782a6.644 6.644 0 1 0 13.288.04V43.266a6.656 6.656 0 0 0-6.648-6.644"
              data-name="Path 2"
            />
          </g>
        </g>
      </g>
    </g>
    <path fill="none" d="M20 12h82v82H20z" data-name="Rectangle 13" />
  </svg>
);
export default SvgRecordbutton;
