import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import MainBox from './MainBox';
import SubBox from './SubBox';
import Game, { GameHandle } from './Game';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword'; // New Import
import ResetPassword from './ResetPassword';   // New Import
import GameSelector from './GameSelector'; // Import the new component
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
    CircularChart3DComponent, 
    CircularChart3DSeriesCollectionDirective, 
    CircularChart3DSeriesDirective, 
    Inject, 
    PieSeries3D, 
    CircularChartDataLabel3D, 
    CircularChartLegend3D, 
    CircularChartTooltip3D,
    Chart3DComponent,
    Chart3DSeriesCollectionDirective,
    Chart3DSeriesDirective,
    Legend3D,
    Category3D,
    Tooltip3D,
    ColumnSeries3D,
    Highlight3D
} from '@syncfusion/ej2-react-charts';
import './Dashboard.css';
import { MarketplaceContent } from './MarketplaceContent';
import { ProfileAvatar } from './ProfileAvatar';
import ModelViewer from './ModelViewer';

// --- Icons ---
const ProfileIcon = () => <img className='profile-icon' src='/blob-models/profile_login.png' alt="Profile" />;
const LogIcon = () => <img className='log-main-icon' src='/blob-models/profile_login.png' alt="Profile" />;
const GamesIcon = () => <img className='games-icon' src='/blob-models/games.png' alt="Games" />;
const CommunityIcon = () => <img className='community-icon' src='/blob-models/community.png' alt="Community" />;
const Friends = () => <img className='friends-icon' src='/blob-icons/Friends.png' alt="Friends" />;
const WalletIcon = () => <img className='wallet-icon' src='/blob-icons/Wallet.png' alt="Wallet" />;
const StatsIcon = () => <img className='stats-icon' src='/blob-icons/Statistics.png' alt="Statistics" />;
const PongIcon = () => <span className='pong-icon'>🏓</span>;
const MafiaIcon = () => <img className='werewolf-icon' src='/blob-icons/werewolf.png' alt="Mafia" />;
const AccountIcon = () => <img className='account-icon' src='/blob-icons/Account.png' alt="Account" />;
const AboutBlobox = () => <img className='about-blobox-icon' src='/blob-icons/AboutBlobox.png' alt="About Blobox" />;
const TermsOfService = () => <img className='tos-icon' src='/blob-icons/TermsOfService.png' alt="Terms of Service" />;
const LoginIcon = () => <img className='login-icon' src='/blob-icons/SignIn.png' alt="Sign In" />;
const RegisterIcon = () => <img className='register-icon' src='/blob-icons/CreateAccount.png' alt="Sign Up" />;
const MarketIcon = () => <img className='market-icon' src='/blob-models/Marketplace.png' alt="Market" />;
const StoreIcon = () => <img className='store-icon' src='/blob-icons/draw_yourself.png' alt="Store" />;
const InfoIcon = () => <img className='info-icon' src='/blob-models/about.png' alt="Info" />;
// --- Content Components ---

const common = 'Offside';

const AboutContent: React.FC = () => {
	return (
		<SubBox title="About" icon={<AboutBlobox />} color="#6366f1">
			<div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<h3 style={{ fontSize: '40px'}}>Welcome to bloBox!</h3>
				<p>
					bloBox is a blockchain-powered gaming social network for communication, self-expression, and competition through crypto-staked social deduction games, where players co-create engaging stories in a transparent, trust-based environment designed to foster meaningful social interaction
				</p>
				<p>
					bloBox focuses on people who love social deduction games. It’s for those who usually don’t gamble, for whom the fun and company matter more than the winnings. That’s why joining and playing on the site doesn’t require any knowledge of cryptocurrency. A wallet is only needed to deposit/withdraw funds or create NFTs. Participation fees in each game session are set by the session creator — while not zero, they can be purely symbolic.
				</p>
				<p>
					At the same time, bloBox also appeals to those who want to leverage their soft skills to earn, by setting higher stakes.
				</p>
			</div>
		</SubBox>
	);
}

const TermsContent: React.FC = () => {
	return (
		<SubBox title="Terms" icon={<TermsOfService />} color="#2d30b7">
			<div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
				<h3 style={{ fontSize: '40px' }}>TERMS OF SERVICE</h3>
				<p>Last updated March 18, 2026</p>
				<h3 style={{ fontSize: '30px' }}>AGREEMENT TO OUR LEGAL TERMS</h3>
				<p>We are bloBox ("Company," "we," "us," "our")</p>
				<p>
					We operate the website www.blobox.games (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
				</p>
				<p>
					You can contact us by phone at +374 93590454, email at coolmartun@gmail.com.</p>
				<p>
					We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by coolmartun@gmail.com, as stated in the email message. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
				</p>
				<p>
					The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
				</p>
				<p>
					We recommend that you print a copy of these Legal Terms for your records.
				</p>
				<h3 style={{ fontSize: '30px' }}>TABLE OF CONTENTS</h3>
				<p>1. OUR SERVICES</p>
				<p>2. INTELLECTUAL PROPERTY RIGHTS</p>
				<p>3. USER REPRESENTATIONS</p>
				<p>4. USER REGISTRATION</p>
				<p>5. PROHIBITED ACTIVITIES</p>
				<p>6. USER GENERATED CONTRIBUTIONS</p>
				<p>7. CONTRIBUTION LICENSE</p>
				<p>8. SERVICES MANAGEMENT</p>
				<p>9. TERM AND TERMINATION</p>
				<p>10. MODIFICATIONS AND INTERRUPTIONS</p>
				<p>11. GOVERNING LAW</p>
				<p>12. DISPUTE RESOLUTION</p>
				<p>13. CORRECTIONS</p>
				<p>14. DISCLAIMER</p>
				<p>15. LIMITATIONS OF LIABILITY</p>
				<p>16. INDEMNIFICATION</p>
				<p>17. USER DATA</p>
				<p>18. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</p>
				<p>19. MISCELLANEOUS</p>
				<p>20. CONTACT US</p>
				<h3 style={{ fontSize: '30px' }}>1. OUR SERVICES</h3>
					The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
					
				<h3 style={{ fontSize: '30px' }}>2. INTELLECTUAL PROPERTY RIGHTS</h3>
					<h3>Our intellectual property</h3>
					We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
					
					Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
					
					The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
					<h3>Your use of our Services</h3>
					Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
					access the Services; and
					download or print a copy of any portion of the Content to which you have properly gained access,
					solely for your personal, non-commercial use or internal business purpose.
					
					Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
					
					If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: coolmartun@gmail.com. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
					
					We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
					
					Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
					<h3>Your submissions and contributions</h3>
					Please review this section and the "PROHIBITED ACTIVITIES" section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
					
					Submissions: By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
					
					Contributions: The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services, including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal information, or other material ("Contributions"). Any Submission that is publicly posted shall also be treated as a Contribution.
					
					You understand that Contributions may be viewable by other users of the Services.
					
					When you post Contributions, you grant us a license (including use of your name, trademarks, and logos): By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicense the licenses granted in this section. Our use and distribution may occur in any media formats and through any media channels.
					
					This license includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.
					
					You are responsible for what you post or upload: By sending us Submissions and/or posting Contributions through any part of the Services or making Contributions accessible through the Services by linking your account through the Services to any of your social networking accounts, you:
					confirm that you have read and agree with our "PROHIBITED ACTIVITIES" and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;
					to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;
					warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licenses to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and
					warrant and represent that your Submissions and/or Contributions do not constitute confidential information.
					You are solely responsible for your Submissions and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.
					
					We may remove or edit your Content: Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such Contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.
					
				<h3 style={{ fontSize: '30px' }}>3. USER REPRESENTATIONS</h3>
					By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.
					
					If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
					
				<h3 style={{ fontSize: '30px' }}>4. USER REGISTRATION</h3>
					You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
					
				<h3 style={{ fontSize: '30px' }}>5. PROHIBITED ACTIVITIES</h3>
					You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
					
					As a user of the Services, you agree not to:
					Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.
					Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.
					Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.
					Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.
					Use any information obtained from the Services in order to harass, abuse, or harm another person.
					Make improper use of our support services or submit false reports of abuse or misconduct.
					Use the Services in a manner inconsistent with any applicable laws or regulations.
					Engage in unauthorized framing of or linking to the Services.
					Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.
					Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.
					Delete the copyright or other proprietary rights notice from any Content.
					Attempt to impersonate another user or person or use the username of another user.
					Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").
					Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.
					Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.
					Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.
					Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.
					Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.
					Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.
					Use a buying agent or purchasing agent to make purchases on the Services.
					Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.
					Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.
					Sell or otherwise transfer your profile.
					Use the Services to advertise or offer to sell goods and services.
					
					<h3 style={{ fontSize: '30px' }}>6. USER GENERATED CONTRIBUTIONS</h3>
					The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
					The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.
					You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.
					You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.
					Your Contributions are not false, inaccurate, or misleading.
					Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.
					Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).
					Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.
					Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.
					Your Contributions do not violate any applicable law, regulation, or rule.
					Your Contributions do not violate the privacy or publicity rights of any third party.
					Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.
					Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.
					Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.
					Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.
					
					<h3 style={{ fontSize: '30px' }}>7. CONTRIBUTION LICENSE</h3>
					By posting your Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.
					
					This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.
					
					We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
					
					We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.
					
					<h3 style={{ fontSize: '30px' }}>8. SERVICES MANAGEMENT</h3>
					We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
					
					<h3 style={{ fontSize: '30px' }}>9. TERM AND TERMINATION</h3>
					These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
					
					If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
					
					<h3 style={{ fontSize: '30px' }}>10. MODIFICATIONS AND INTERRUPTIONS</h3>
					We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
					
					We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
					
					<h3 style={{ fontSize: '30px' }}>11. GOVERNING LAW</h3>
					These Legal Terms shall be governed by and defined following the laws of Georgia. bloBox and yourself irrevocably consent that the courts of Georgia shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
					
					<h3 style={{ fontSize: '30px' }}>12. DISPUTE RESOLUTION</h3>
					You agree to irrevocably submit all disputes related to these Legal Terms or the legal relationship established by these Legal Terms to the jurisdiction of the __________ courts. bloBox shall also maintain the right to bring proceedings as to the substance of the matter in the courts of the country where you reside or, if these Legal Terms are entered into in the course of your trade or profession, the state of your principal place of business.
					
					<h3 style={{ fontSize: '30px' }}>13. CORRECTIONS</h3>
					There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
					
					<h3 style={{ fontSize: '30px' }}>14. DISCLAIMER</h3>
					THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
					
					<h3 style={{ fontSize: '30px' }}>15. LIMITATIONS OF LIABILITY</h3>
					IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
					
					<h3 style={{ fontSize: '30px' }}>16. INDEMNIFICATION</h3>
					You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
					
					<h3 style={{ fontSize: '30px' }}>17. USER DATA</h3>
					We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
					
					<h3 style={{ fontSize: '30px' }}>18. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h3>
					Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
					
					<h3 style={{ fontSize: '30px' }}>19. MISCELLANEOUS</h3>
					These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
					
					<h3 style={{ fontSize: '30px' }}>20. CONTACT US</h3>
					In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
					
					bloBox
					Tbilisi
					Georgia
					Phone: +374 93590454
					coolmartun@gmail.com
					
					This Terms and Conditions was created using Termly's Terms and Conditions Generator</div>
		</SubBox>
	);
}

const WalletContent: React.FC = () => {
	const { user, fetchWithAuth, updateUser } = useAuth();
	const { theme } = useTheme();
	const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	const [savedAddress, setSavedAddress] = useState(user?.walletAddress || '');
	
	const [isSaving, setIsSaving] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const [filter, setFilter] = useState('WEEK');
	const [chartData, setChartData] = useState([]);

	const chartRef = useRef<any>(null);      // Reference to the Chart
    const containerRef = useRef<HTMLDivElement>(null); // Reference to the Div wrapper

    // Watch for size changes and force chart refresh
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (chartRef.current) {
                chartRef.current.refresh();
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

	// Auto-hide messages after 3 seconds
	useEffect(() => {
		if (msg) {
			const timer = setTimeout(() => setMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [msg]);

	useEffect(() => {
		setWalletAddress(user?.walletAddress || '');
		setSavedAddress(user?.walletAddress || '');
	}, [user]);

	const refreshProfile = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/users/current/full`);
			if (res.ok) {
				const data = await res.json();
				if (data.success && data.user)
				{
					updateUser(data.user);
					setSavedAddress(data.user.walletAddress || '');
				}
			}
		} catch (e) { console.error(e); }
	};

	// Fetch current balance on mount
	useEffect(() => {
		refreshProfile();
	}, []);

	const fetchData = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/transactions/filtered`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filter })
			});
			if (res.ok) {
				const data = await res.json();
				let transformed = data.transactions.map((item: any) => {
					let x: string;
					if (filter === 'WEEK') {
						x = new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
					} else {
						const dateStr = item.month + '-01';
						x = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
					}
					const y = item.total / 100; // cents to dollars
					return { x, y };
				});

				// For months views, show year only when it changes
				if (filter !== 'WEEK') {
					let currentYear = '';
					transformed.forEach((item: {x: string, y: number}, index: number) => {
						const date = new Date(data.transactions[index].month + '-01');
						const year = date.getFullYear().toString();
						const month = date.toLocaleDateString('en-US', { month: 'short' });
						if (year !== currentYear) {
							item.x = `${month} ${year}`;
							currentYear = year;
						} else {
							item.x = month;
						}
					});
				}

				setChartData(transformed);
			}
		} catch (e) { console.error(e); }
	};

	useEffect(() => { fetchData(); }, [filter]);

	const handleUpdateWallet = async () => {
		if (isSaving) return;

		setIsSaving(true);
		setMsg(null); 

		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			const res = await fetchWithAuth(`${serverUrl}/api/users`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ walletAddress })
			});

			if (res.ok) {
				setMsg({ type: 'success', text: 'Wallet address updated!' });
				setSavedAddress(walletAddress);
				refreshProfile();
			} else {
				setMsg({ type: 'error', text: 'Failed to update wallet address' });
			}
		} catch (e) {
			setMsg({ type: 'error', text: 'Network error' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleWithdraw = async () => {
		if (!withdrawAmount) return;
		if (isWithdrawing) return;
		
		setIsWithdrawing(true);
		setMsg(null);

		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			const res = await fetchWithAuth(`${serverUrl}/api/transactions/withdraw`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: Number(withdrawAmount) })
			});

			if (res.ok) {
				const data = await res.json();
				setMsg({ type: 'success', text: data.message || 'Withdrawal request accepted!' });
				setWithdrawAmount('');
				refreshProfile();
			} else {
				const data = await res.json();
				setMsg({ type: 'error', text: data.message || 'Withdrawal failed' });
			}
		} catch (error) {
			setMsg({ type: 'error', text: 'Network error' });
		} finally {
			setIsWithdrawing(false);
		}
	};

	const onChartLoad = (args: any) => {
		const chartEl = document.getElementById('withdrawal-chart');
		if (chartEl) chartEl.setAttribute('title', '');
	};

	const load = (args: any) => {
		args.chart.theme = 'MaterialDark';
	};

	// Check if address has changed from saved value
	const isAddressUnchanged = walletAddress === savedAddress;

	return (
		<div className="wallet-content">
			<div className="wallet-header-card">
				<h3>Balance</h3>
				<p className="balance">{(user?.balance ?? 0).toFixed(2)} BLOB</p>
				<span className="withdrawable">Withdrawable: {(user?.withdrawAmount ?? 0).toFixed(2)}</span>
			</div>

			<div className="wallet-actions">
				<div className="input-group">
					<label>Address</label>
					<div className="input-row">
						<input
							type="text"
							placeholder="0x..."
							value={walletAddress}
							onChange={e => setWalletAddress(e.target.value)}
							disabled={isSaving}
						/>
						<button 
							className="action-btn update" 
							onClick={handleUpdateWallet}
							disabled={isAddressUnchanged || isSaving}
							style={{ 
								opacity: (isAddressUnchanged || isSaving) ? 0.5 : 1, 
								cursor: (isAddressUnchanged || isSaving) ? 'not-allowed' : 'pointer' 
							}}
						>
							{isSaving ? 'Updating...' : 'Update'}
						</button>
					</div>
				</div>

				<div className="input-group">
					<label>Withdraw</label>
					<div className="input-row">
						<input 
							type="number" 
							placeholder="0.00"
							value={withdrawAmount}
							onChange={(e) => {
								const val = e.target.value;
								// Regex: Allows integers, or decimals with up to 2 digits
								if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
									setWithdrawAmount(val);
								}
							}}
							disabled={isWithdrawing}
							step="0.01" // Helps some browsers show appropriate keyboard
							min="0"
						/>
						<button 
							className="action-btn withdraw" 
							onClick={handleWithdraw}
							disabled={isWithdrawing || !withdrawAmount}
							style={{ 
								opacity: (isWithdrawing || !withdrawAmount) ? 0.5 : 1, 
								cursor: (isWithdrawing || !withdrawAmount) ? 'not-allowed' : 'pointer' 
							}}
						>
							{isWithdrawing ? '...' : 'Cash Out'}
						</button>
					</div>
				</div>
			</div>

			{msg && <div className={`error-box-${msg.type}`}>{msg.text}</div>}

			<div className="withdrawal-chart-section">
				<div className="filter-dropdown">
					<select style={{fontFamily: common, fontSize: '16px'}} value={filter} onChange={(e) => setFilter(e.target.value)}>
						<option value="WEEK">Week</option>
						<option value="3MONTHS">3 Months</option>
						<option value="YEAR">Year</option>
					</select>
				</div>
				<div className='control-pane'>
					<div className='control-section' ref={containerRef}>
						<Chart3DComponent
							ref={chartRef}
							id='withdrawal-chart'
							style={{ textAlign: "center" }}
							primaryXAxis={{ labelRotation: filter === 'YEAR' ? -34 : -13, labelIntersectAction: 'None', interval: 1, valueType: 'Category', labelPlacement: 'BetweenTicks', labelStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: common } }}
							wallColor='transparent'
							height="300"
							primaryYAxis={{ labelFormat: '{value} BLOB', labelStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: common } }}
							load={load}
							enableRotation={true}
							rotation={7}
							tilt={10}
							depth={100}
							tooltip={{ enable: true, header: "${point.x}", format: 'Amount: <b>${point.y}</b>', textStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: common } }}
							width="100%"
							title='Withdrawal History'
							titleStyle={{ color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: common }}
							background="transparent"
							loaded={onChartLoad}
						>
							<Inject services={[ColumnSeries3D, Legend3D, Tooltip3D, Category3D, Highlight3D]}/>
							<Chart3DSeriesCollectionDirective>
								<Chart3DSeriesDirective
									dataSource={chartData}
									xName='x'
									columnSpacing={0.1}
									yName='y'
									type='Column'
									animation={{ enable: false }}
								>
								</Chart3DSeriesDirective>
							</Chart3DSeriesCollectionDirective>
						</Chart3DComponent>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Updated Stats Layout ---
// --- Updated Stats Layout with Pagination ---
const StatsContent: React.FC = () => {
    const { fetchWithAuth } = useAuth();
    const { theme } = useTheme();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // 4 looks best to avoid internal scrolling

    const pieChartRef = useRef<any>(null);
    const pieContainerRef = useRef<HTMLDivElement>(null);

    // --- Animation & Resize Logic (Preserved) ---
    const [enableAnimation, setEnableAnimation] = useState(true);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setEnableAnimation(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        if (loading) return;
        let resizeTimer: ReturnType<typeof setTimeout>;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (pieChartRef.current) {
                    pieChartRef.current.refresh();
                }
            }, 200);
        });
        if (pieContainerRef.current) {
            resizeObserver.observe(pieContainerRef.current);
        }
        return () => {
            resizeObserver.disconnect();
            clearTimeout(resizeTimer);
        };
    }, [loading]);

    const onChartLoad = (args: any) => {
        const chartEl = document.getElementById('charts');
        if (chartEl) chartEl.setAttribute('title', '');
    };

    const load = (args: any) => {
        args.chart.theme = 'MaterialDark';
    };

    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await fetchWithAuth(`${serverUrl}/api/tournaments`);
                if (response.ok) {
                    const data = await response.json();
                    setGames(data.tournaments || []);
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        loadGames();
    }, [fetchWithAuth, serverUrl]);

    if (loading) return <div>Loading...</div>;

    // --- PAGINATION LOGIC ---
    const indexOfLastGame = currentPage * itemsPerPage;
    const indexOfFirstGame = indexOfLastGame - itemsPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(games.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // --- Chart Data Processing ---
    const earningsMap = games.reduce((acc, game) => {
        const name = game.gameName || 'Unknown Game';
        const score = parseFloat(game.score) || 0;
        acc[name] = (acc[name] || 0) + score;
        return acc;
    }, {} as Record<string, number>);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

    type ChartItem = { x: string; y: number; text: string; fill: string };

    const rawChartData: ChartItem[] = Object.entries(earningsMap).map(([name, total], idx) => ({
        x: name,
        y: Number(total) || 0,
        text: `${name}: ${total}`,
        fill: COLORS[idx % COLORS.length],
    }));

    const totalEarnings = rawChartData.reduce((s, d) => s + d.y, 0);

    return (
        <div className="stats-content">
            {/* Game List with Pagination */}
            <div className="game-list">
                 {games.length === 0 ? (
                    <div className="empty-state">No games played recently</div>
                ) : (
                    <>
                        {currentGames.map((game, i) => (
                            <div key={i} className="game-item">
                                <div className="game-header">
                                    <span>{game.gameName || `Game #${game.id}`}</span>
                                    <div>Played at {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                                <div className="game-details">
                                    <div>Place: <span className={game.placementName === 'Winner' || game.placementName === '1' ? 'text-won' : 'text-lost'}>{game.placementName}</span></div>
                                    <div>Fee: <span className="text-secondary">{game.fee} BLOB</span></div>
                                    <div>Score: <span className="text-secondary">{game.score} BLOB</span></div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {games.length > itemsPerPage && (
                            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: 'auto', paddingTop: '10px', alignItems: 'center' }}>
                                <button 
                                    className="action-btn" 
                                    onClick={prevPage} 
                                    disabled={currentPage === 1}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    className="action-btn" 
                                    onClick={nextPage} 
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Chart Section */}
            {(
                <div className="earnings-chart-container" ref={pieContainerRef}>
                    <div className="earnings-chart-canvas" style={{ background: 'transparent', border: '' }}>
                        {totalEarnings > 0 ? (
                            <CircularChart3DComponent 
                                ref={pieChartRef}
                                id='charts'  
                                style={{ textAlign: "center" }}
                                load={load}
                                loaded={onChartLoad}
                                titleStyle={{ 
                                    color: theme === 'light' ? '#111827' : '#ffffff',
                                    fontFamily: common, 
                                }}
                                legendSettings={{ 
                                    visible: false,
                                    position: 'Bottom',
                                    textStyle: { 
                                        color: theme === 'light' ? '#000000' : '#ffffff',
                                        fontFamily: common
                                        // fontWeight: 'bold',
                                    },
                                }}
                                tooltip={{ 
                                    enable: true, format: '${point.x} : ${point.y} BLOB', textStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New', } }}
                                rotation={15}
                                tilt={-15}
                                depth={30}
                                background="transparent"
                                enableRotation={true}
                                title="Earnings by game this week"
                            >
                                <Inject services={[PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, CircularChartTooltip3D]} />
                                <CircularChart3DSeriesCollectionDirective>
                                    <CircularChart3DSeriesDirective 
                                        animation={{ enable: enableAnimation }}
                                        dataSource={rawChartData} 
                                        xName='x' 
                                        yName='y' 
                                        pointColorMapping="fill"
                                        radius='60%'
                                        dataLabel={{
                                            visible: true, 
                                            position: 'Outside', 
                                            name: 'text',
                                            font: { 
                                                // fontWeight: '700',
                                                color: theme === 'light' ? '#111827' : '#ffffff',
                                                fontFamily: common,
                                            },
                                            connectorStyle: { length: '20px' }
                                        }}
                                    >
                                    </CircularChart3DSeriesDirective>
                                </CircularChart3DSeriesCollectionDirective>
                            </CircularChart3DComponent>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 50 }}>
                                No earnings to display
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// --- Updated Friends Layout with GameSelector support ---
interface UserProfile { id: string; username: string; email: string; }
interface FriendshipRequest { id: string; sender: string; }

const FriendsContent: React.FC = () => {
		const { user, fetchWithAuth } = useAuth();
		const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
		const [friends, setFriends] = useState<UserProfile[]>([]);
		const [requests, setRequests] = useState<FriendshipRequest[]>([]);
		const [targetEmail, setTargetEmail] = useState('');
		const [loading, setLoading] = useState(false);
		const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
		
		// State to track who we are inviting
		const [inviteTarget, setInviteTarget] = useState<{id: string, username: string} | null>(null);

		const serverUrl = import.meta.env.VITE_SERVER_URL;

		const apiCall = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
				try {
						const res = await fetchWithAuth(`${serverUrl}/api/friends${endpoint}`, {
								method: method,
								body: JSON.stringify(body),
								headers: !endpoint.includes("/accept") && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}
						});
						if (res.ok) return await res.json();
				} catch (err: any) {
						setMsg({ type: 'error', text: err.message });
						return null;
				}
		}, [fetchWithAuth, serverUrl]);

		const refreshData = useCallback(async () => {
				setLoading(true);
				if (activeTab === 'friends') {
						const data = await apiCall('/');
						if (data) setFriends(data.data.map((d: { friend: UserProfile; }) => d.friend) || []);
				} else if (activeTab === 'requests') {
						const data = await apiCall('/requests');
						if (data) setRequests(data.data || []);
				}
				setLoading(false);
		}, [activeTab, apiCall]);

		useEffect(() => { if (user) refreshData(); }, [user, activeTab, refreshData]);

		const sendRequest = async (e: React.FormEvent) => {
				e.preventDefault();
				if (!targetEmail) return;
				const res = await apiCall('', 'POST', { email: targetEmail });
				if (res) {
						setMsg({ type: 'success', text: `Request sent to ${targetEmail}` });
						setTargetEmail('');
				}
		};

		const respondToRequest = async (id: string, accept: boolean) => {
				const endpoint = accept ? `/accept/${id}` : `/reject/${id}`;
				const method = accept ? 'POST' : 'DELETE';
				const res = await apiCall(endpoint, method);
				if (res) {
						setMsg({ type: 'success', text: accept ? 'Added' : 'Ignored' });
						refreshData();
				}
		};

		// --- INTERCEPT RENDER: If inviting, show GameSelector ---
		if (inviteTarget) {
				return (
						<div style={{ height: '100%' }}>
								<GameSelector 
										friendId={inviteTarget.id} 
										username={inviteTarget.username} 
										onClose={() => setInviteTarget(null)} 
								/>
						</div>
				);
		}

		return (
			<div className="friends-content-full">
				 <div className="friends-tabs">
						<button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>Friends</button>
						<button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests {requests.length > 0 && `(${requests.length})`}</button>
						<button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add</button>
				 </div>
				 
				 {msg && <div className={`msg-banner ${msg.type}`}>{msg.text}</div>}

				 <div className="friends-list-container">
						{loading && <div>Loading...</div>}
						
						{activeTab === 'friends' && !loading && (
								<div className="simple-list">
										{friends.length === 0 && <p>No friends yet.</p>}
										{friends.map(f => (
												<div key={f.id} className="friend-row">
														<span className="name">{f.username}</span>
														<button 
																className="action-btn" 
																style={{ width: 'auto', padding: '0 8px', background: '#eab308' }}
																onClick={() => setInviteTarget({ id: f.id, username: f.username })}
																title="Invite to Game"
														>
															Invite
														</button>
												</div>
										))}
								</div>
						)}

						{activeTab === 'requests' && !loading && (
								<div className="simple-list">
										{requests.length === 0 && <p>No requests.</p>}
										{requests.map(r => (
												<div key={r.id} className="request-row">
														<span className="name">{r.sender}</span>
														<div className="actions">
																<button onClick={() => respondToRequest(r.id, true)} className="btn-small accept">✓</button>
																<button onClick={() => respondToRequest(r.id, false)} className="btn-small reject">✕</button>
														</div>
												</div>
										))}
								</div>
						)}

						{activeTab === 'add' && (
								<form onSubmit={sendRequest} className="add-form">
										<input 
											type="email" 
											placeholder="friend@email.com" 
											value={targetEmail} 
											onChange={e => setTargetEmail(e.target.value)} 
											required 
										/>
										<button type="submit" className="action-btn">Send Request</button>
								</form>
						)}
				 </div>
			</div>
		);
};

// --- Invitations Content (game invites from NotificationContext) ---
const InvitationsContent: React.FC = () => {
	const { notifications, removeNotification, acceptGameInvite } = useNotification();
	const gameInvites = notifications.filter(n => n.type === 'game-invite');

	if (gameInvites.length === 0) {
		return (
			<div className="invitations-empty">
				<p>No pending invitations</p>
			</div>
		);
	}

	return (
		<div className="invitations-list">
			{gameInvites.map(invite => (
				<div key={invite.id} className="invitation-card">
					<div className="invitation-info">
						<span className="invitation-sender">{invite.message}</span>
					</div>
					<div className="invitation-actions">
						<button
							className="invite-btn invite-accept"
							onClick={() => {
								acceptGameInvite(invite.data.roomId);
								removeNotification(invite.id);
							}}
							title="Accept"
						>
							✓
						</button>
						<button
							className="invite-btn invite-decline"
							onClick={() => removeNotification(invite.id)}
							title="Decline"
						>
							✗
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

// --- BloboxIcon Component ---
const BloboxIcon = () => (
	<img className='blobox-icon' src='../../logo.png' alt='Blobox' />
);

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
	const { isAuthenticated, logout, user, fetchWithAuth } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const gameRef = useRef<GameHandle>(null);
	const mafiaRef = useRef<GameHandle>(null);


	// Track visibility of main windows in guest view
	const [visibleBoxes, setVisibleBoxes] = useState({
		login: true,
		blobox: true,
		about: true,
	});

	// Track which MainBox overlay is active (null = guest view)
	// Which inner box is open inside main-profile (null = none)
	const [activeInnerBox, setActiveInnerBox] = useState<string | null>(null);

	// --- NEW: Reset Password State ---
	const [showForgot, setShowForgot] = useState(false);
	const [resetToken, setResetToken] = useState<string | null>(null);
	const [resetSuccess, setResetSuccess] = useState(false);

	const reopenBox = (box: keyof typeof visibleBoxes) => {
		setVisibleBoxes(prev => ({ ...prev, [box]: true }));
	};

	// --- NEW: Reset Password Logic ---
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('resetToken');
		
		if (token) {
			setResetToken(token);
			// const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
			// window.history.replaceState({path: newUrl}, "", newUrl);
			if (isAuthenticated) logout();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty dependency array ensures this runs only on mount

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			if (event.data.type === 'OPEN_FORGOT_PASSWORD') {
				setShowForgot(true);
			}
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	// const handleResetSuccess = () => {
	// 	setResetSuccess(true);
		
	// 	// FIX: Clear the URL here, once we know the operation is successful
	// 	window.history.replaceState({}, document.title, window.location.pathname);
		
	// 	setTimeout(() => {
	// 		setResetToken(null);
	// 		setResetSuccess(false);
	// 		reopenBox('login');
	// 	}, 3000); 
	// };
	// ---------------------------------

	const handleLogout = () => {
		if (gameRef.current)
		{
			gameRef.current.sendLogout();
		}

		// if (mafiaRef.current)
		// {
		// 	mafiaRef.current.sendLogout();
		// }

		logout();
	};

	const closedBoxes = Object.entries(visibleBoxes)
		.filter(([_, visible]) => !visible)
		.map(([name]) => name);

	// Avatar data for the logged-in strip
	const [avatarModelUrl, setAvatarModelUrl] = useState<string>('');
	const [avatarTextureUrl, setAvatarTextureUrl] = useState<string>('');
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	// Fetch user's default avatar NFT when authenticated
	useEffect(() => {
		if (!isAuthenticated) return;
		const loadAvatar = async () => {
			try {
				const defaultRes = await fetchWithAuth(`${serverUrl}/api/nft/user/default?gameType=Avatar`);
				if (defaultRes.ok) {
					const data = await defaultRes.json();
					if (data.tokenId) {
						// Fetch inventory to find the texture
						const invRes = await fetchWithAuth(`${serverUrl}/api/nft/user?gameType=All`);
						if (invRes.ok) {
							const nfts = await invRes.json();
							const skin = nfts.find((n: any) => n.tokenId === data.tokenId);
							if (skin) {
								setAvatarTextureUrl(skin.image || '');
								// Get GLB model
								if (skin.model && skin.model !== 'Unknown') {
									const glbRes = await fetchWithAuth(`${serverUrl}/api/nft/skin?name=${skin.model}`);
									if (glbRes.ok) {
										const glbData = await glbRes.json();
										setAvatarModelUrl(glbData.url || '/DavidLow.glb');
									}
								} else {
									setAvatarModelUrl('/DavidLow.glb');
								}
							}
						}
					} else {
						setAvatarModelUrl('/DavidLow.glb');
					}
				} else {
					setAvatarModelUrl('/DavidLow.glb');
				}
			} catch {
				setAvatarModelUrl('/DavidLow.glb');
			}
		};
		loadAvatar();
	}, [isAuthenticated, fetchWithAuth, serverUrl]);

	// Click handlers for guest main-profile buttons
	const handleProfileClick = () => {
		if (isAuthenticated) setActiveInnerBox('profile');
	};

	const handleMarketplaceClick = () => {
		if (isAuthenticated) setActiveInnerBox('marketplace');
	};

	const handleCommunityClick = () => {
		if (isAuthenticated) setActiveInnerBox('community');
	};

	const handlePongClick = () => {
		if (isAuthenticated) setActiveInnerBox('pong');
	};

	const handleWerewolfClick = () => {
		if (isAuthenticated) setActiveInnerBox('werewolf');
	};

	const avatarRef = useRef<HTMLDivElement>(null);

	// Reload key — incremented to force the Game iframe to remount
	const [gameReloadKey, setGameReloadKey] = useState(0);

	// Handle game invite acceptance - open Pong and force reload
	useEffect(() => {
		const handler = () => {
			if (isAuthenticated) {
				setActiveInnerBox('pong');
				setGameReloadKey(prev => prev + 1);
			}
		};
		window.addEventListener('RESET_GAME_VIEW', handler);
		return () => window.removeEventListener('RESET_GAME_VIEW', handler);
	}, [isAuthenticated]);

	const closeInnerBox = () => setActiveInnerBox(null);

	return (
		<div className="dashboard">
			{/* Reopen buttons for closed guest windows */}
			{closedBoxes.length > 0 && (
				<div className="closed-boxes-bar">
					{closedBoxes.map((box) => (
						<button
							key={box}
							className="reopen-btn"
							onClick={() => reopenBox(box as keyof typeof visibleBoxes)}
						>
							Open {box.charAt(0).toUpperCase() + box.slice(1)}
						</button>
					))}
				</div>
			)}
			
			<div className="dashboard-content">
				{/* --- NEW: Reset Password Overlay --- */}
				{resetToken && (
					<div style={{
						position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						backdropFilter: 'blur(5px)'
					}}>
						<div style={{ width: '1450px', height: '650px', display: 'flex' }}>
							 {/* Simplified: Just one MainBox that is permanently open */}
							 <MainBox 
								title="Reset Password" 
								id="reset-password-main"
								icon={<ProfileIcon />} 
								color="#ef4444" 
								openMaximized
								alwaysOpen
							 >
								<SubBox title='' icon={<i></i>} color="#ef4444" defaultMaximized={true} >
									<div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
											<div style={{ width: '400px', maxWidth: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
												<ResetPassword token={resetToken} />
											</div>
									</div>
								</SubBox>
							 </MainBox>
						</div>
					</div>
				)}
				{/* ----------------------------------- */}

					{/* Guest View */}
					<div style={{ display: 'contents' }}>
						{/* Login Window */}

						{visibleBoxes.login && (
							<MainBox 
								key="main-profile" 
								id="main-profile" 
								title="bloBox"
								icon={<AccountIcon />}
								color="#f59e0b"
								alwaysOpen
							>
								{/* Login strip: shows login or username+avatar based on auth */}
								{!isAuthenticated ? (
									<MainBox 
										key="login-main" 
										id="login-main" 
										title="login needed" 
										icon={<i></i>}
										color="#f59e0b"
										openMaximized
									>
										<div className="profile-grid">
											{/* Row 1: Login nested MainBox (replaces Account) + Wallet (locked) */}
											<div className="profile-grid-item">
												<MainBox
													key="login-nested"
													id="login-nested"
													title="login"
													icon={<i></i>}
													color="#f59e0b"
													openMaximized
												>
													<SubBox 
														title={showForgot ? "Recovery" : "Sign In"} 
														icon={showForgot ? <ProfileIcon /> : <LoginIcon />} 
														color="#f59e0b"
														onOpenChange={(open) => {
															if (!open) {
																setShowForgot(false);
															}
														}}
													>
														{showForgot ? (
															<div style={{ position: 'relative', height: '100%' }}>
																<ForgotPassword />
															</div>
														) : (
															<Login />
														)}
													</SubBox>

													<SubBox title="Sign Up" icon={<RegisterIcon />} color="#6366f1">
														<Register />
													</SubBox>
												</MainBox>
											</div>
											<div className="profile-grid-item wallet-item">
												<SubBox title="Wallet" icon={<WalletIcon />} color="#f59e0b">
													<div className="community-locked">
														<img className="community-locked-icon" src='/blob-icons/lock.png' />
														<p className="please-log-in-title">please Log in</p>
													</div>
												</SubBox>
											</div>

											{/* Row 2: Theme changer + About (left), Statistics (right) */}
											<div className="profile-grid-item profile-grid-left-stack">
												{/* Theme changer blob */}
												<div className="theme-blob-container">
													<img className="theme-blob-bg" src="/blob-icons/theme_blob_lighting.png" alt="Theme" />
													<div className="theme-blob-options">
														<button 
															className={`theme-blob-option ${theme === 'light' ? 'active' : ''}`}
															onClick={() => { if (theme !== 'light') toggleTheme(); }}
															title="Light"
														>
															<span className="theme-blob-circle light-circle"></span>
														</button>
														<button 
															className={`theme-blob-option ${theme === 'dark' ? 'active' : ''}`}
															onClick={() => { if (theme !== 'dark') toggleTheme(); }}
															title="Dark"
														>
															<span className="theme-blob-circle dark-circle"></span>
														</button>
													</div>
													<span className="theme-blob-label">theme</span>
												</div>

												{/* About nested MainBox */}
												<MainBox
													key="about-nested-guest"
													id="about-nested"
													title="about"
													icon={<i></i>}
													color="#6366f1"
													openMaximized
												>
													<AboutContent />
													<TermsContent />
												</MainBox>
											</div>

											<div className="profile-grid-item stats-item">
												<SubBox title="Statistics" icon={<StatsIcon />} color="#3b82f6">
													<div className="community-locked">
														<img className="community-locked-icon" src='/blob-icons/lock.png' />
														<p className="please-log-in-title">please Log in</p>
													</div>
												</SubBox>
											</div>
										</div>
									</MainBox>
								) : (
									<MainBox 
										key="user-main" 
										id="login-main" 
										title={user?.username || 'User'}
										icon={
											<div className="guest-user-avatar">
												<ModelViewer 
													url={ avatarModelUrl || '/DavidLow.glb'}
													textureUrl={avatarTextureUrl || undefined}
													width={180}
													height={180}
													minDistance={5}
													maxDistance={5}
												/>
											</div>
										}
										color="#f59e0b"
										openMaximized
									>
										<div className="profile-grid">
											{/* Row 1: Account + Wallet */}
											<div className="profile-grid-item account-item">
												<SubBox
													title="Account"
													icon={<ModelViewer 
													url={avatarModelUrl || '/DavidLow.glb'}
													textureUrl={avatarTextureUrl || undefined}
													width={800}
													height={920}
													modelScale={2}
													minDistance={0}
													maxDistance={1.69}
												/>}
													color="#10b981">
													<div className="account-content">
														<ProfileAvatar />
														<div style={{ textAlign: 'center', marginBottom: 6 }}>
															<div className="account-info">
																<div><strong>Username</strong> {user?.username || 'N/A'}</div>
																<div><strong>Email</strong> {user?.email || 'N/A'}</div>
															</div>
														</div>
														<button className="action-btn" onClick={handleLogout}>Logout</button>
													</div>
												</SubBox>
											</div>
											<div className="profile-grid-item wallet-item">
												<SubBox title="Wallet" icon={<WalletIcon />} color="#f59e0b">
													<WalletContent />
												</SubBox>
											</div>

											{/* Row 2: Theme changer + About (left), Statistics (right) */}
											<div className="profile-grid-item profile-grid-left-stack">
												{/* Theme changer blob */}
												<div className="theme-blob-container">
													<img className="theme-blob-bg" src="/blob-icons/theme_blob_lighting.png" alt="Theme" />
													<div className="theme-blob-options">
														<button 
															className={`theme-blob-option ${theme === 'light' ? 'active' : ''}`}
															onClick={() => { if (theme !== 'light') toggleTheme(); }}
															title="Light"
														>
															<span className="theme-blob-circle light-circle"></span>
														</button>
														<button
															className={`theme-blob-option ${theme === 'dark' ? 'active' : ''}`}
															onClick={() => { if (theme !== 'dark') toggleTheme(); }}
															title="Dark"
														>
															<span className="theme-blob-circle dark-circle"></span>
														</button>
													</div>
													<span className="theme-blob-label">theme</span>
												</div>

												{/* About nested MainBox */}
												<MainBox
													key="about-nested"
													id="about-nested"
													title="about"
													icon={<i></i>}
													color="#6366f1"
													openMaximized
												>
													<AboutContent />
													<TermsContent />
												</MainBox>
											</div>

											<div className="profile-grid-item stats-item">
												<SubBox title="Statistics" icon={<StatsIcon />} color="#3b82f6">
													<StatsContent />
												</SubBox>
											</div>
										</div>
									</MainBox>
								)}

								{/* Inner overlay boxes — open maximized inside main-profile */}
								{isAuthenticated && activeInnerBox === 'pong' && (
									<MainBox
										key="pong-inner"
										id="inner-overlay"
										title="Pong"
										icon={<PongIcon />}
										color="#ec4899"
										openMaximized
										onRestore={closeInnerBox}
									>
										<div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
											<Game
												key={`pong-${gameReloadKey}`}
												ref={gameRef}
												url={import.meta.env.VITE_PONG_URL!}
											/>
										</div>
									</MainBox>
								)}

								{isAuthenticated && activeInnerBox === 'werewolf' && (
									<MainBox
										key="werewolf-inner"
										id="inner-overlay"
										title="Werewolf"
										icon={<MafiaIcon />}
										color="#dc2626"
										openMaximized
										onRestore={closeInnerBox}
									>
										{/* <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Coming Soon</div>
										 */}

										 <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
											<Game
												ref={mafiaRef}
												url={import.meta.env.VITE_MAFIA_URL!}
											/>
										</div>
									</MainBox>
								)}

								{isAuthenticated && activeInnerBox === 'marketplace' && (
									<MainBox
										key="marketplace-inner"
										id="inner-overlay"
										title="Store"
										icon={<MarketIcon />}
										color="#000000"
										openMaximized
										onRestore={closeInnerBox}
									>
										<SubBox title="Draw" icon={<StoreIcon />} color="#a855f7">
											<MarketplaceContent />
										</SubBox>
									</MainBox>
								)}

								{/* Werewolf content area */}
								<div className="guest-werewolf-content" onClick={handleWerewolfClick}>
									<img className="guest-werewolf-img" src="/blob-icons/werewolf.png" alt="Werewolf" />
									<div className="guest-werewolf-title">WEREWOLF</div>
									
									{/* Blob-shaped nav buttons */}
									<div className="guest-blob-buttons">
										<div className="games-blob-container" onClick={(e) => { e.stopPropagation(); }}>
											<img className="games-blob-bg" src="/blob-icons/games_blob_lighting.png" alt="Games" />
											<div className="games-blob-circle circle-left" onClick={(e) => { e.stopPropagation(); }}>
												<img src="/blob-icons/in_development.png" alt="In Development" />
											</div>
											<div className="games-blob-circle circle-center" onClick={(e) => { e.stopPropagation(); handlePongClick(); }}>
												<img src="/blob-icons/pong.png" alt="Pong" />
											</div>
											<span className="games-blob-title">games</span>
										</div>
										<div className="store-blob-container" onClick={(e) => { e.stopPropagation(); handleMarketplaceClick(); }}>
											<img className="store-blob-bg" src="/blob-icons/store_blob_lighting.png" alt="Store" />
											<img className="store-blob-icon-overlay" src="/blob-icons/store.png" alt="Store" />
											<span className="store-blob-title">store</span>
										</div>
									</div>
								</div>
							</MainBox>
						)}

						{/* Community box */}
						<MainBox 
							key="community-guest" 
							id="community-guest" 
							title="Community" 
							icon={<CommunityIcon />}
							color="#ec4899"
						>
							{isAuthenticated ? (
									<SubBox title="Friends" icon={<Friends />} color="#3b82f6">
										<FriendsContent />
									</SubBox>
							) 
							: (
								<div className="community-locked">
									<img className="community-locked-icon" src='/blob-icons/lock.png' />
									<p className="please-log-in-title">please Log in</p>
								</div>
							)}
							{isAuthenticated && (
								<SubBox title="Invitations" icon={<Friends />} color="#3b82f6">
									<InvitationsContent />
								</SubBox>
							)}
						</MainBox>

						{/* Blobox Window - Shows logo, clicks to expand when authenticated
						{visibleBoxes.blobox && (
							<MainBox 
								key="blobox" 
								id="blobox" 
								title="bloBox" 
								icon={<BloboxIcon />} 
								color="#10b981"
								onClickWhenClosed={isAuthenticated ? handleBloboxClick : undefined}
							>
								{isAuthenticated ? (
									<SubBox 
										title="Enter Blobox"
										icon={<span>🚀</span>}
										color="#10b981" 
										defaultMaximized
									>
										<div style={{
											padding: 20, 
											display: 'flex', 
											flexDirection: 'column', 
											alignItems: 'center',
											textAlign: 'center',
											gap: 15
										}}>
											<h3>Welcome back, {user?.username}!</h3>
											<p>Click to enter your dashboard</p>
											<button 
												className="play-btn" 
												onClick={handleBloboxClick}
												style={{ padding: '12px 24px', fontSize: '16px' }}
											>
												🚀 Enter Blobox
											</button>
										</div>
									</SubBox>
								) : (
									<div className="blobox-guest-message">
										<span className="lock-icon">🔒</span>
										<h3>Welcome to bloBox</h3>
										<p>Please login to access your dashboard, games, and community features.</p>
									</div>
								)}
							</MainBox>
						)} */}

						{/* About Window */}
						{/* {visibleBoxes.about && (
							<MainBox 
								key="about"
								id="about" 
								title="About" 
								icon={<InfoIcon />} 
								color="#6366f1"
							>
								<SubBox
									title="Terms"
									icon={<TermsOfService />}
									color="#2d30b7"
								>

								</SubBox>
								<SubBox 
									title="About" 
									icon={<AboutBlobox />} 
									color="#6366f1" 
								>
									<div style={{
										padding: 20, 
										display: 'flex', 
										flexDirection: 'column', 
										alignItems: 'center',
										textAlign: 'center'
									}}>
										<h3>Welcome to bloBox</h3>
										<p>Lorem ipsum dolor sit amet...</p>
										<p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
											Play games, connect with friends, and earn rewards!
										</p>
									</div>
								</SubBox>
							</MainBox>
						)} */}
					</div>
			</div>


		</div>
	);
};

export default Dashboard;