import { useCustomer } from "autumn-js/react";

export function useBilling() {
	const { customer, check } = useCustomer();

	const isPro = check({ productId: "pro" }).data?.allowed === true;
	const isLoading = customer === undefined || customer === null;

	return {
		customer,
		isPro,
		isLoading,
		check,
	};
}
