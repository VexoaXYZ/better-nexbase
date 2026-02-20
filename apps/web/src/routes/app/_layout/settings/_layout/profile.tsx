import { api } from "@backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_layout/settings/_layout/profile")({
	component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
	const { user } = useAuth();
	const currentUser = useQuery(api.users.getCurrentUser);
	const upsertUser = useMutation(api.users.upsertUser);

	const [name, setName] = useState("");

	useEffect(() => {
		if (currentUser?.name) setName(currentUser.name);
	}, [currentUser?.name]);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setIsSaving(true);
		setMessage(null);

		try {
			await upsertUser({
				authId: user.id,
				email: user.email || "",
				name: name || undefined,
				profileImageUrl: user.profilePictureUrl || undefined,
			});
			setMessage({ type: "success", text: "Profile updated successfully" });
		} catch {
			setMessage({ type: "error", text: "Failed to update profile" });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Profile Info */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your personal information and how others see you.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSave} className="space-y-6">
						{/* Avatar */}
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								{user?.profilePictureUrl ? (
									<AvatarImage
										src={user.profilePictureUrl}
										alt={user.firstName || user.email || "User"}
									/>
								) : null}
								<AvatarFallback className="bg-zinc-700 text-lg">
									{user?.firstName?.[0] ||
										user?.email?.[0]?.toUpperCase() ||
										"?"}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-sm text-white">Profile Photo</p>
								<p className="text-muted-foreground text-xs">
									Your profile photo is managed by your identity provider.
								</p>
							</div>
						</div>

						<Separator />

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Display Name</Label>
								<Input
									id="name"
									type="text"
									placeholder="Your name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={user?.email || ""}
									disabled
									className="cursor-not-allowed opacity-60"
								/>
								<p className="text-muted-foreground text-xs">
									Email is managed by your identity provider.
								</p>
							</div>
						</div>

						{message && (
							<div
								className={cn(
									"rounded-lg border p-3 text-sm",
									message.type === "success"
										? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
										: "border-red-500/20 bg-red-500/10 text-red-400",
								)}
							>
								{message.text}
							</div>
						)}

						<div className="flex justify-end">
							<Button type="submit" disabled={isSaving}>
								{isSaving ? (
									<>
										<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Account Info */}
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>
						Information about your account and authentication.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="font-medium text-sm text-zinc-400">User ID</p>
							<p className="mt-1 font-mono text-sm text-white">
								{user?.id?.slice(0, 20)}...
							</p>
						</div>
						<div>
							<p className="font-medium text-sm text-zinc-400">
								Authentication Provider
							</p>
							<p className="mt-1 text-sm text-white">WorkOS AuthKit</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
