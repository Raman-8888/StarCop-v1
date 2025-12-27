import React from 'react';
import './ProfileCard.css';
import { QRCodeSVG } from 'qrcode.react';

const ProfileCard = ({ profile }) => {
    if (!profile) return null;

    const formatDate = (dateString) => {
        if (!dateString) return [];
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return [...day.split(''), '/', ...month.split(''), '/', ...year.split('')];
    };

    const joinDateChars = formatDate(profile.createdAt || new Date().toISOString());

    const isStartup = profile.accountType === 'startup';
    const details = isStartup ? profile.startupDetails : profile.investorDetails;

    return (
        <div className="flex flex-col items-center">
            {/* Output Decoration Removed */}

            <div className="area">
                <div className="area-wrapper">
                    <div className="ticket-mask">
                        <div className="ticket">
                            <div className="ticket-flip-container">
                                <div className="float">
                                    {/* FRONT SIDE */}
                                    <div className="front">
                                        <div className="ticket-body">
                                            <div className="reflex"></div>

                                            {/* SVG Cube Decoration */}
                                            <svg class="icon-cube" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path style={{ "--i": 1 }} class="path-center" d="M12 12.75L14.25 11.437M12 12.75L9.75 11.437M12 12.75V15" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 2 }} class="path-t" d="M9.75 3.562L12 2.25L14.25 3.563" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 3 }} class="path-tr" d="M21 7.5L18.75 6.187M21 7.5V9.75M21 7.5L18.75 8.813" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 4 }} class="path-br" d="M21 14.25V16.5L18.75 17.813" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 5 }} class="path-b" d="M12 21.75L14.25 20.437M12 21.75V19.5M12 21.75L9.75 20.437" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 6 }} class="path-bl" d="M5.25 17.813L3 16.5V14.25" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <path style={{ "--i": 7 }} class="path-tl" d="M3 7.5L5.25 6.187M3 7.5L5.25 8.813M3 7.5V9.75" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                            </svg>

                                            <header>
                                                <div className="ticket-name">
                                                    <div>
                                                        <span style={{ "--i": 1 }}>S</span>
                                                        <span style={{ "--i": 2 }}>T</span>
                                                        <span style={{ "--i": 3 }}>A</span>
                                                        <span style={{ "--i": 4 }}>R</span>
                                                        <span style={{ "--i": 5 }}>C</span>
                                                        <span style={{ "--i": 6 }}>O</span>
                                                        <span style={{ "--i": 7 }}>P</span>
                                                    </div>
                                                    <div>
                                                        <span className="bold" style={{ "--i": 8 }}>U</span>
                                                        <span className="bold" style={{ "--i": 9 }}>S</span>
                                                        <span className="bold" style={{ "--i": 10 }}>E</span>
                                                        <span className="bold" style={{ "--i": 11 }}>R</span>
                                                    </div>
                                                </div>
                                                <div className="barcode"></div>
                                            </header>

                                            <div className="contents">
                                                <div className="event">
                                                    <div>
                                                        <span className="bold">{profile.name}</span>
                                                    </div>
                                                    <div>{profile.username}</div>
                                                </div>

                                                <div className="mt-8 text-sm font-semibold uppercase tracking-widest text-gray-500">
                                                    {profile.accountType}
                                                </div>

                                                <div className="number">#{profile._id.slice(-4)}</div>

                                                <div className="qrcode">
                                                    {/* Using QR Code component for dynamic value */}
                                                    <QRCodeSVG value={`https://starcop.com/user/${profile.username}`} size={70} fgColor="#796db8" bgColor="transparent" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BACK SIDE */}
                                    <div className="back">
                                        <div className="ticket-body">
                                            <div className="reflex"></div>
                                            <header>
                                                <div className="ticket-name">
                                                    <div>
                                                        <span style={{ "--i": 1 }}>F</span>
                                                        <span style={{ "--i": 2 }}>U</span>
                                                        <span style={{ "--i": 3 }}>L</span>
                                                        <span style={{ "--i": 4 }}>L</span>
                                                    </div>
                                                    <b>
                                                        <span className="bold" style={{ "--i": 8 }}>I</span>
                                                        <span className="bold" style={{ "--i": 9 }}>N</span>
                                                        <span className="bold" style={{ "--i": 10 }}>F</span>
                                                        <span className="bold" style={{ "--i": 11 }}>O</span>
                                                    </b>
                                                </div>

                                                <time>
                                                    {joinDateChars.map((char, index) => (
                                                        <span key={index} style={{ "--i": 11 + index }} className={['/', ':'].includes(char) ? 'slash' : 'bold'}>
                                                            {char}
                                                        </span>
                                                    ))}
                                                </time>
                                            </header>

                                            <div className="contents">
                                                <div className="profile-details">
                                                    <div className="detail-row">
                                                        <strong>Email:</strong>
                                                        <span>{profile.email}</span>
                                                    </div>
                                                    {profile.phoneNumber && (
                                                        <div className="detail-row">
                                                            <strong>Phone:</strong>
                                                            <span>{profile.phoneNumber}</span>
                                                        </div>
                                                    )}

                                                    {details && Object.entries(details).map(([key, value]) => {
                                                        if (!value || typeof value !== 'string') return null;
                                                        // format camelCase to Title Case
                                                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                                                        return (
                                                            <div className="detail-row" key={key}>
                                                                <strong>{label}:</strong>
                                                                <span>{value}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="qrcode">
                                                    <QRCodeSVG value={`https://starcop.com/user/${profile.username}`} size={120} fgColor="#796db8" bgColor="transparent" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="noise">
                <svg height="100%" width="100%">
                    <defs>
                        <pattern height="500" width="500" patternUnits="userSpaceOnUse" id="noise-pattern">
                            <filter y="0" x="0" id="noise">
                                <feTurbulence stitchTiles="stitch" numOctaves="3" baseFrequency="0.65" type="fractalNoise"></feTurbulence>
                                <feBlend mode="screen"></feBlend>
                            </filter>
                            <rect filter="url(#noise)" height="500" width="500"></rect>
                        </pattern>
                    </defs>
                    <rect fill="url(#noise-pattern)" height="100%" width="100%"></rect>
                </svg>
            </div>
        </div>
    );
};

export default ProfileCard;
