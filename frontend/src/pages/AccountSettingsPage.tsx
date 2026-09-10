import { useEffect, useState } from "react";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getCurrentUser,
  updateCurrentUser,
  type CurrentUser,
} from "../services/user.service";

import {
  getPatient,
  updatePatient,
  type Patient,
} from "../services/patient.service";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../services/user-address.service";

import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "../services/emergency-contact.service";

import {
  accountSettingsSchema,
  type AccountSettingsForm,
} from "../validators/account-settings.validator";

type AddressType = "HOME" | "WORK" | "OTHER";

const emptyAddress = {
  dbId: undefined,
  addressType: "HOME" as AddressType,
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const emptyEmergencyContact = {
  dbId: undefined,
  contactName: "",
  contactPhone: "",
  contactRelationship: "",
  isPrimary: false,
};

function AccountSettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null,
  );

  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(
    null,
  );

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountSettingsForm>({
    resolver: zodResolver(accountSettingsSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      addresses: [],
      emergencyContacts: [],
    },
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const {
    fields: emergencyContactFields,
    append: appendEmergencyContact,
    remove: removeEmergencyContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  useEffect(() => {
    loadAccountData();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  async function loadAccountData() {
    try {
      setIsLoading(true);
      setLoadError("");

      const [
        userResponse,
        patientResponse,
        addressesResponse,
        emergencyContactsResponse,
      ] = await Promise.all([
        getCurrentUser(),
        getPatient(),
        getAddresses(),
        getEmergencyContacts(),
      ]);

      const currentUser = userResponse.data;
      const currentPatient = patientResponse.data;

      setUser(currentUser);
      setPatient(currentPatient);

      reset({
        firstName: currentPatient.firstName ?? "",
        lastName: currentPatient.lastName ?? "",
        email: currentUser.email ?? "",
        phone: currentUser.phone ?? "",

        dateOfBirth: currentPatient.dateOfBirth
          ? currentPatient.dateOfBirth.slice(0, 10)
          : "",

        gender: currentPatient.gender ?? "",
        bloodGroup: currentPatient.bloodGroup ?? "",

        addresses: addressesResponse.data.map((item) => ({
          dbId: item.id,

          addressType:
            item.addressType === "WORK" || item.addressType === "OTHER"
              ? item.addressType
              : "HOME",

          addressLine1: item.address.addressLine1 ?? "",
          addressLine2: item.address.addressLine2 ?? "",
          landmark: item.address.landmark ?? "",
          city: item.address.city ?? "",
          state: item.address.state ?? "",
          pincode: item.address.pincode ?? "",
          country: item.address.country ?? "India",
          isDefault: item.isDefault,
        })),

        emergencyContacts: emergencyContactsResponse.data.map((item) => ({
          dbId: item.id,
          contactName: item.contactName ?? "",
          contactPhone: item.contactPhone ?? "",
          contactRelationship: item.contactRelationship ?? "",
          isPrimary: item.isPrimary,
        })),
      });
    } catch (error) {
      console.error("Account settings load failed:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your account information.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function addAddress() {
    if (addressFields.length >= 3) {
      return;
    }

    appendAddress({
      ...emptyAddress,
      dbId: undefined,
      isDefault: addressFields.length === 0,
    });

    setEditingAddressIndex(addressFields.length);
  }

  function addEmergencyContact() {
    if (emergencyContactFields.length >= 3) {
      return;
    }

    appendEmergencyContact({
      ...emptyEmergencyContact,
      dbId: undefined,
      isPrimary: emergencyContactFields.length === 0,
    });

    setEditingContactIndex(emergencyContactFields.length);
  }

  function isDraft(id?: string) {
    return !id;
  }

  function hasAddressData(address: AccountSettingsForm["addresses"][number]) {
    return Boolean(
      address.addressLine1.trim() ||
      address.addressLine2.trim() ||
      address.landmark.trim() ||
      address.city.trim() ||
      address.state.trim() ||
      address.pincode.trim(),
    );
  }

  function isAddressComplete(
    address: AccountSettingsForm["addresses"][number],
  ) {
    return Boolean(
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim(),
    );
  }

  function hasContactData(
    contact: AccountSettingsForm["emergencyContacts"][number],
  ) {
    return Boolean(
      contact.contactName.trim() ||
      contact.contactPhone.trim() ||
      contact.contactRelationship.trim(),
    );
  }

  function isContactComplete(
    contact: AccountSettingsForm["emergencyContacts"][number],
  ) {
    return Boolean(
      contact.contactName.trim() &&
      contact.contactPhone.trim() &&
      contact.contactRelationship.trim(),
    );
  }

  function cancelAddress(index: number) {
    const address = getValues(`addresses.${index}`);

    if (isDraft(address.dbId)) {
      removeAddress(index);
    }

    setEditingAddressIndex(null);
  }

  function cancelEmergencyContact(index: number) {
    const contact = getValues(`emergencyContacts.${index}`);

    if (isDraft(contact.dbId)) {
      removeEmergencyContact(index);
    }

    setEditingContactIndex(null);
  }

  async function handleDeleteAddress(index: number) {
    const address = getValues(`addresses.${index}`);

    if (!address.dbId) {
      removeAddress(index);
      setEditingAddressIndex(null);
      return;
    }

    try {
      setDeletingId(address.dbId);
      setSaveError("");

      await deleteAddress(address.dbId);

      removeAddress(index);
      setEditingAddressIndex(null);

      setSuccessMessage("Address deleted successfully.");
    } catch (error) {
      console.error("Address deletion failed:", error);

      setSaveError("Unable to delete the address. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteEmergencyContact(index: number) {
    const contact = getValues(`emergencyContacts.${index}`);

    if (!contact.dbId) {
      removeEmergencyContact(index);
      setEditingContactIndex(null);
      return;
    }

    try {
      setDeletingId(contact.dbId);
      setSaveError("");

      await deleteEmergencyContact(contact.dbId);

      removeEmergencyContact(index);
      setEditingContactIndex(null);

      setSuccessMessage("Emergency contact deleted successfully.");
    } catch (error) {
      console.error("Emergency contact deletion failed:", error);

      setSaveError("Unable to delete the emergency contact. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function onSubmit(data: AccountSettingsForm) {
    try {
      setSaveError("");
      setSuccessMessage("");

      const incompleteAddress = data.addresses.find(
        (address) => hasAddressData(address) && !isAddressComplete(address),
      );

      if (incompleteAddress) {
        setSaveError(
          "Please complete all address fields or cancel the incomplete address.",
        );
        return;
      }

      const incompleteContact = data.emergencyContacts.find(
        (contact) => hasContactData(contact) && !isContactComplete(contact),
      );

      if (incompleteContact) {
        setSaveError(
          "Please complete all emergency contact fields or cancel the incomplete contact.",
        );
        return;
      }

      await Promise.all([
        updateCurrentUser({
          email: data.email,
          phone: data.phone || null,
        }),

        updatePatient({
          firstName: data.firstName,
          lastName: data.lastName,

          dateOfBirth: data.dateOfBirth || undefined,

          gender: data.gender || undefined,
          bloodGroup: data.bloodGroup || undefined,
        }),
      ]);

      const completeAddresses = data.addresses.filter(isAddressComplete);

      const completeContacts = data.emergencyContacts.filter(isContactComplete);

      await Promise.all(
        completeAddresses.map(async (address) => {
          const addressData = {
            addressLine1: address.addressLine1.trim(),
            addressLine2: address.addressLine2.trim() || undefined,
            landmark: address.landmark.trim() || undefined,
            city: address.city.trim(),
            state: address.state.trim(),
            country: address.country.trim() || "India",
            pincode: address.pincode.trim(),
            addressType: address.addressType,
            isDefault: address.isDefault,
          };

          if (address.dbId) {
            await updateAddress(address.dbId, addressData);
          } else {
            await createAddress(addressData);
          }
        }),
      );

      await Promise.all(
        completeContacts.map(async (contact) => {
          const contactData = {
            contactName: contact.contactName.trim(),
            contactPhone: contact.contactPhone.trim(),
            contactRelationship: contact.contactRelationship.trim(),
            isPrimary: contact.isPrimary,
          };

          if (contact.dbId) {
            await updateEmergencyContact(contact.dbId, contactData);
          } else {
            await createEmergencyContact(contactData);
          }
        }),
      );

      setEditingAddressIndex(null);
      setEditingContactIndex(null);

      await loadAccountData();

      setSuccessMessage(
        "Your account information has been updated successfully.",
      );
    } catch (error) {
      console.error("Account settings update failed:", error);

      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to update your account information. Please try again.",
      );
    }
  }

  function handleFormError(formErrors: FieldErrors<AccountSettingsForm>) {
    console.error("Account settings validation errors:", formErrors);

    setSaveError("Please check the highlighted fields.");
  }

  function handleCancel() {
    setSaveError("");
    setSuccessMessage("");
    setEditingAddressIndex(null);
    setEditingContactIndex(null);

    void loadAccountData();
  }

  if (isLoading) {
    return (
      <main className="min-h-full bg-[#f0f7ff] p-6 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
            <p className="text-sm text-[#64748b]">
              Loading account settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-full bg-[#f0f7ff] p-6 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {loadError}

            <button
              type="button"
              onClick={() => void loadAccountData()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f0f7ff] p-6 lg:p-10">
      {successMessage && (
        <div className="fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
            ✓
          </span>

          <span>{successMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-[28px] font-bold leading-tight text-[#0f172a]">
            Account Settings
          </h1>

          <p className="mt-1 text-sm text-[#64748b]">
            Keep your personal credentials and emergency contact info up to date
            to ensure safe care.
          </p>
        </header>

        {saveError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit, handleFormError)}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="flex flex-col gap-6">
            {/* PERSONAL INFORMATION */}

            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <div className="mb-5 border-b border-[#e2e8f0] pb-4">
                <h2 className="text-lg font-semibold text-[#0f172a]">
                  Personal Information
                </h2>

                <p className="mt-1 text-[13px] text-[#64748b]">
                  Your official legal name and secure contact credentials.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    {...register("firstName")}
                    className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      {...register("lastName")}
                      className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                    />

                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                    />

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                    >
                      Date of Birth
                    </label>

                    <input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                    >
                      Gender
                    </label>

                    <select
                      id="gender"
                      {...register("gender")}
                      className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="bloodGroup"
                      className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]"
                    >
                      Blood Group
                    </label>

                    <select
                      id="bloodGroup"
                      {...register("bloodGroup")}
                      className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDRESSES */}

            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <div className="mb-5 flex items-start justify-between border-b border-[#e2e8f0] pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">
                    Residential Address
                  </h2>

                  <p className="mt-1 text-[13px] text-[#64748b]">
                    Save addresses for clinical visits and other healthcare
                    services.
                  </p>
                </div>

                {addressFields.length < 3 && (
                  <button
                    type="button"
                    onClick={addAddress}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[#bae6fd] px-3 py-2 text-sm font-semibold text-[#0284c7] hover:bg-[#f0f9ff]"
                  >
                    <span className="text-base">+</span>
                    Add
                  </button>
                )}
              </div>

              {addressFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbd5e1] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#334155]">
                    No address added yet
                  </p>

                  <p className="mt-1 text-xs text-[#64748b]">
                    Add your residential or work address.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addressFields.map((field, index) => {
                    const isEditing = editingAddressIndex === index;

                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
                      >
                        {!isEditing ? (
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#0f172a]">
                                  {field.addressType === "WORK"
                                    ? "Work"
                                    : field.addressType === "OTHER"
                                      ? "Other"
                                      : "Home"}
                                </p>

                                {field.isDefault && (
                                  <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-semibold text-[#0284c7]">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm text-[#334155]">
                                {field.addressLine1}
                                {field.addressLine2
                                  ? `, ${field.addressLine2}`
                                  : ""}
                              </p>

                              {field.landmark && (
                                <p className="mt-1 text-xs text-[#64748b]">
                                  Near {field.landmark}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-[#64748b]">
                                {field.city}, {field.state} - {field.pincode}
                              </p>

                              <p className="mt-1 text-xs text-[#64748b]">
                                {field.country}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setEditingAddressIndex(index)}
                                className="text-xs font-semibold text-[#0284c7]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === field.dbId}
                                onClick={() => void handleDeleteAddress(index)}
                                className="text-xs font-semibold text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  Address Type
                                </label>

                                <select
                                  {...register(
                                    `addresses.${index}.addressType`,
                                  )}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                >
                                  <option value="HOME">Home</option>
                                  <option value="WORK">Work</option>
                                  <option value="OTHER">Other</option>
                                </select>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  Pincode
                                </label>

                                <input
                                  {...register(`addresses.${index}.pincode`)}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                Street Address
                              </label>

                              <input
                                {...register(`addresses.${index}.addressLine1`)}
                                className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                Address Line 2
                              </label>

                              <input
                                {...register(`addresses.${index}.addressLine2`)}
                                className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                Landmark
                              </label>

                              <input
                                {...register(`addresses.${index}.landmark`)}
                                className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  City
                                </label>

                                <input
                                  {...register(`addresses.${index}.city`)}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  State
                                </label>

                                <input
                                  {...register(`addresses.${index}.state`)}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  Country
                                </label>

                                <input
                                  {...register(`addresses.${index}.country`)}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-[#334155]">
                              <input
                                type="checkbox"
                                {...register(`addresses.${index}.isDefault`)}
                                className="h-4 w-4 rounded border-[#cbd5e1]"
                              />
                              Set as default address
                            </label>

                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                disabled={deletingId === field.dbId}
                                onClick={() => void handleDeleteAddress(index)}
                                className="text-sm font-semibold text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => cancelAddress(index)}
                                  className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#64748b]"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingAddressIndex(null)}
                                  className="rounded-lg bg-[#0284c7] px-4 py-2 text-sm font-semibold text-white"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* EMERGENCY CONTACTS */}

            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <div className="mb-5 flex items-start justify-between border-b border-[#e2e8f0] pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">
                    Emergency Contact
                  </h2>

                  <p className="mt-1 text-[13px] text-[#64748b]">
                    People we can contact in case of an emergency.
                  </p>
                </div>

                {emergencyContactFields.length < 3 && (
                  <button
                    type="button"
                    onClick={addEmergencyContact}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[#bae6fd] px-3 py-2 text-sm font-semibold text-[#0284c7] hover:bg-[#f0f9ff]"
                  >
                    <span className="text-base">+</span>
                    Add
                  </button>
                )}
              </div>

              {emergencyContactFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbd5e1] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#334155]">
                    No emergency contact added
                  </p>

                  <p className="mt-1 text-xs text-[#64748b]">
                    Add someone we can contact during an emergency.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {emergencyContactFields.map((field, index) => {
                    const isEditing = editingContactIndex === index;

                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
                      >
                        {!isEditing ? (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#0f172a]">
                                  {field.contactName}
                                </p>

                                {field.isPrimary && (
                                  <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-semibold text-[#0284c7]">
                                    Primary
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-[#64748b]">
                                {field.contactRelationship}
                              </p>

                              <p className="mt-1 text-sm text-[#334155]">
                                {field.contactPhone}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setEditingContactIndex(index)}
                                className="text-xs font-semibold text-[#0284c7]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === field.dbId}
                                onClick={() =>
                                  void handleDeleteEmergencyContact(index)
                                }
                                className="text-xs font-semibold text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                Contact Name
                              </label>

                              <input
                                {...register(
                                  `emergencyContacts.${index}.contactName`,
                                )}
                                className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  Emergency Phone
                                </label>

                                <input
                                  type="tel"
                                  {...register(
                                    `emergencyContacts.${index}.contactPhone`,
                                  )}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                                  Relationship
                                </label>

                                <input
                                  {...register(
                                    `emergencyContacts.${index}.contactRelationship`,
                                  )}
                                  className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3.5 text-sm outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                                />
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-[#334155]">
                              <input
                                type="checkbox"
                                {...register(
                                  `emergencyContacts.${index}.isPrimary`,
                                )}
                                className="h-4 w-4 rounded border-[#cbd5e1]"
                              />
                              Set as primary emergency contact
                            </label>

                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                disabled={deletingId === field.dbId}
                                onClick={() =>
                                  void handleDeleteEmergencyContact(index)
                                }
                                className="text-sm font-semibold text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => cancelEmergencyContact(index)}
                                  className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#64748b]"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingContactIndex(null)}
                                  className="rounded-lg bg-[#0284c7] px-4 py-2 text-sm font-semibold text-white"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-lg border border-[#e2e8f0] bg-white px-6 py-3 text-sm font-semibold text-[#64748b] hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[#0284c7] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0369a1] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save & Update Changes"}
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="text-base font-semibold text-[#0f172a]">
                Profile Image
              </h2>

              <div className="mt-5 flex justify-center">
                <div className="relative">
                  <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#e0f2fe] text-[#0284c7]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-16 w-16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
                    </svg>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0284c7] text-lg text-white shadow-sm disabled:cursor-not-allowed"
                    title="Profile photo upload will be added later"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-medium text-[#0f172a]">
                  Upload a new photo
                </p>

                <p className="mt-1 text-xs text-[#64748b]">
                  JPG or PNG. Max size of 800K.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#64748b]">
                  MEDICO PATIENT ID
                </p>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                  ● Verified
                </span>
              </div>

              <p className="mt-4 break-all text-xl font-bold text-[#0f172a]">
                #{patient?.id}
              </p>

              <p className="mt-2 text-xs text-[#64748b]">
                Registered Member since{" "}
                {patient?.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>

              <div className="my-4 border-t border-[#e2e8f0]" />

              <p className="text-[11px] leading-[1.4] text-[#64748b]">
                🔒 Medico encrypts and processes your medical and identity data
                using appropriate security controls.
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default AccountSettingsPage;
