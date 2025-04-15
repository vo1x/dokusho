"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

import { UserCircle, LogIn, LogOut, User } from "lucide-react";

export default function Navigation() {
	const { data: session } = useSession();

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);

	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const profileRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				profileRef.current &&
				!profileRef.current.contains(event.target as Node)
			) {
				setIsDropdownVisible(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleDropdown = () => {
		if (!isDropdownVisible) setIsDropdownVisible(!isDropdownVisible);
	};

	return (
		<nav
			className="sticky top-0 z-50 border-dokusho-highlight-low border-b bg-dokusho-base/90 p-3 shadow-lg backdrop-blur-lg transition-transform duration-300"
			style={{ transform: "translateY(var(--nav-translate, 0))" }}
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between">
				<Link href="/" className="font-bold text-2xl">
					Dokusho
				</Link>

				<div>
					<div className="flex items-center gap-4">
						<button
							ref={profileRef}
							onClick={toggleDropdown}
							className="flex aspect-square h-11 w-11 items-center justify-center rounded-md border border-dokusho-highlight-low bg-dokusho-overlay text-dokusho-subtle transition-colors hover:border-dokusho-highlight-med focus:outline-none"
						>
							{session?.user?.image ? (
								<Image
									src={session.user.image}
									alt="Profile"
									width={36}
									height={36}
									className="aspect-square h-auto w-full rounded-md object-cover"
								/>
							) : (
								<UserCircle className="text-dokusho-primary" color="#8bbadd" />
							)}
						</button>
					</div>

					{isDropdownVisible && (
						<div
							ref={dropdownRef}
							className={`absolute right-0 mt-2 mr-4 flex w-48 flex-col gap-4 overflow-hidden rounded-md border border-dokusho-highlight-low bg-dokusho-overlay p-4 text-sm text-white/80 shadow-dokusho-shadow/20 shadow-lg transition-all duration-150 ease-in-out
						`}
						>
							{!session && (
								<button
									onClick={() => signIn("anilist")}
									className="flex cursor-pointer items-center gap-2 rounded-md hover:bg-dokusho-highlight-high"
								>
									<LogIn size={18}></LogIn>
									<span>Log in with AniList</span>
								</button>
							)}

							<div className="py-1">
								<Link
									href="/profile"
									className="flex flex items-center items-center gap-2"
								>
									<User size={18} />
									Profile
								</Link>
							</div>

							{session && (
								<button
									onClick={() => signOut()}
									className="flex w-full items-center gap-2 rounded-md text-dokusho-danger"
								>
									<LogOut size={18} />
									Sign out
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
