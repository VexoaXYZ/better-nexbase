import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useReducer } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface InviteMemberDialogProps {
	organizationId: Id<"organizations">;
	trigger?: React.ReactNode;
}

interface InviteState {
	isOpen: boolean;
	email: string;
	role: "admin" | "member";
	isSubmitting: boolean;
	error: string | null;
	inviteLink: string | null;
	emailSent: boolean;
}

type InviteAction =
	| { type: "OPEN" }
	| { type: "CLOSE" }
	| { type: "SET_OPEN"; value: boolean }
	| { type: "SET_EMAIL"; value: string }
	| { type: "SET_ROLE"; value: "admin" | "member" }
	| { type: "SUBMIT_START" }
	| { type: "SUBMIT_SUCCESS"; inviteLink: string; emailSent: boolean }
	| { type: "SUBMIT_ERROR"; error: string }
	| { type: "RESET_FORM" };

const initialState: InviteState = {
	isOpen: false,
	email: "",
	role: "member",
	isSubmitting: false,
	error: null,
	inviteLink: null,
	emailSent: false,
};

function inviteReducer(state: InviteState, action: InviteAction): InviteState {
	switch (action.type) {
		case "OPEN":
			return { ...state, isOpen: true };
		case "CLOSE":
			return { ...initialState };
		case "SET_OPEN":
			return action.value ? { ...state, isOpen: true } : { ...initialState };
		case "SET_EMAIL":
			return { ...state, email: action.value };
		case "SET_ROLE":
			return { ...state, role: action.value };
		case "SUBMIT_START":
			return { ...state, isSubmitting: true, error: null };
		case "SUBMIT_SUCCESS":
			return {
				...state,
				isSubmitting: false,
				inviteLink: action.inviteLink,
				emailSent: action.emailSent,
			};
		case "SUBMIT_ERROR":
			return { ...state, isSubmitting: false, error: action.error };
		case "RESET_FORM":
			return { ...state, inviteLink: null, email: "" };
	}
}

export function InviteMemberDialog({
	organizationId,
	trigger,
}: InviteMemberDialogProps) {
	const [state, dispatch] = useReducer(inviteReducer, initialState);
	const { isOpen, email, role, isSubmitting, error, inviteLink, emailSent } =
		state;

	const invite = useMutation(api.members.invite);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		dispatch({ type: "SUBMIT_START" });

		try {
			const result = await invite({
				organizationId,
				email,
				role,
			});

			const link = `${window.location.origin}/invite/${result.token}`;
			dispatch({
				type: "SUBMIT_SUCCESS",
				inviteLink: link,
				emailSent: Boolean((result as { emailSent?: boolean }).emailSent),
			});
		} catch (err) {
			dispatch({
				type: "SUBMIT_ERROR",
				error: err instanceof Error ? err.message : "Failed to send invitation",
			});
		}
	};

	const handleClose = () => {
		dispatch({ type: "CLOSE" });
	};

	const handleCopyLink = async () => {
		if (inviteLink) {
			await navigator.clipboard.writeText(inviteLink);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(value) => dispatch({ type: "SET_OPEN", value })}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<svg
							className="mr-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
						Invite Member
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				{inviteLink ? (
					<>
						<DialogHeader>
							<DialogTitle>Invitation sent!</DialogTitle>
							<DialogDescription>
								{emailSent
									? `An invitation email was sent to ${email}.`
									: `Share this link with ${email} to invite them to your organization.`}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="flex items-center gap-2">
								<Input value={inviteLink} readOnly className="flex-1 text-xs" />
								<Button variant="secondary" size="sm" onClick={handleCopyLink}>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									<span className="sr-only">Copy link</span>
								</Button>
							</div>
							<p className="text-xs text-zinc-500">
								This invite link expires in 7 days. Keep it as a fallback even
								when email delivery is enabled.
							</p>
						</div>
						<DialogFooter>
							<Button variant="secondary" onClick={handleClose}>
								Done
							</Button>
							<Button onClick={() => dispatch({ type: "RESET_FORM" })}>
								Invite Another
							</Button>
						</DialogFooter>
					</>
				) : (
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle>Invite team member</DialogTitle>
							<DialogDescription>
								Invite a new member to your organization. They&apos;ll receive
								an email invitation.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email address</Label>
								<Input
									id="email"
									type="email"
									placeholder="colleague@company.com"
									value={email}
									onChange={(e) =>
										dispatch({ type: "SET_EMAIL", value: e.target.value })
									}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<Select
									value={role}
									onValueChange={(value) =>
										dispatch({
											type: "SET_ROLE",
											value: value as "admin" | "member",
										})
									}
								>
									<SelectTrigger id="role">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="admin">
											<div className="flex flex-col">
												<span>Admin</span>
												<span className="text-xs text-zinc-500">
													Can manage members and settings
												</span>
											</div>
										</SelectItem>
										<SelectItem value="member">
											<div className="flex flex-col">
												<span>Member</span>
												<span className="text-xs text-zinc-500">
													Can access organization resources
												</span>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{error && (
								<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
									{error}
								</div>
							)}
						</div>
						<DialogFooter>
							<Button type="button" variant="secondary" onClick={handleClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || !email}>
								{isSubmitting ? (
									<>
										<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
										Sending...
									</>
								) : (
									"Send Invitation"
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
