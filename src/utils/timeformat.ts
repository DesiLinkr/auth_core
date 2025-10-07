export const Customformat = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;

  const time =
    minutes > 0
      ? `${formattedHour}:${minutes.toString().padStart(2, "0")} ${ampm}`
      : `${formattedHour} ${ampm}`;

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  return `${time}, ${formattedDate}`;
};
