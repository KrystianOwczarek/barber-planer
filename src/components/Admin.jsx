import { useState, useEffect, useRef } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { Button, ButtonGroup } from "reactstrap";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { auth, db } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { ToastContainer, toast } from "react-toastify";
import {
  updateDoc,
  getDoc,
  getDocs,
  doc,
  arrayUnion,
  collection,
} from "firebase/firestore";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import List from "@mui/material/List";
import { v4 as uuidv4 } from "uuid";

export default function ClientPlanner() {

  //services list
  const [services, setServices] = useState([
    {
      id: 1,
      name: "HAIRCUT",
      price: 40,
      time: 15,
    },
  ]);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 5,
      slidesToSlide: 3, // Przesuwaj o 3 elementy na raz na dużych ekranach
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 3,
      slidesToSlide: 2, // Przesuwaj o 2 elementy na raz na ekranach desktopowych
    },
    tablet: {
      breakpoint: { max: 768, min: 464 },
      items: 2,
      slidesToSlide: 1, // Przesuwaj o 1 element na raz na tabletach
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // Przesuwaj o 1 element na raz na telefonach
    },
  };

  const [selected, setSelected] = useState(services[0]);
  const [price, setPrice] = useState(40);
  const [time, setTime] = useState(15);
  const [selectedDate, setSelectedDate] = useState();
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [checkedTime, setCheckedTime] = useState();
  const name = useRef();
  const surname = useRef();
  const phone = useRef();
  const servicename = useRef();
  const serviceduration = useRef();
  const serviceprice = useRef();
  const [allReservations, setAllReservations] = useState();
  const [filteredUserReservations, setFilteredUserReservations] = useState();
  const [existAccountsArray, setExistAccountsArray] = useState();
  const [filteredIntervals, setFilteredIntervals] = useState([]);
  const [isActive, setIsActive] = useState("Booking");
  const [openStates, setOpenStates] = useState({});
  const [isChanged, setIsChanged] = useState(true);
  const [isUpdated, setIsUpdated] = useState(true);

  const errorToast = () =>
    toast.error("Please select the service, date, and time.");
  const errorTimeToast = () => toast.error("Please select a different time.");
  const errorPhoneToast = () => toast.error("Please enter phone number.");
  const errorServiceToast = () => toast.error("Please fill in all fields.");
  const deleteServiceToast = () => toast.error("The service has been removed.");
  const errorServiceLength = () => toast.error("There must be at least one service in the table.");
  const successToast = () =>
    toast.success("The appointment has been scheduled.");
  const successServiceToast = () => toast.success("The service was added successfully.");
  //
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const threeMonthsLater = new Date(currentDate);
  threeMonthsLater.setMonth(currentDate.getMonth() + 3);

  //logout function
  const logout = () => {
    signOut(auth);
  };

  //checking if the user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.displayName === "client") {
        navigate("/client-planner");
      }
    }

    if (!user) {
      navigate("/");
    }
  });

  const handleToggle = (id) => {
    setOpenStates((prevOpenStates) => ({
      ...prevOpenStates,
      [id]: !prevOpenStates[id],
    }));
  };

  const changeSelect = (e) => {
    setPrice(e.price);
    setTime(e.time);
    setSelected(services[e.id - 1]);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const handleSelect = (arg) => {
    setSelectedDate(arg.startStr);
  };

  async function getServices() {
    const services = await getDoc(doc(db, "services", "h5GWbuVAl34xOtpJIHLo"));
    setServices(services.data().services);
  }

  const getUsersData = async () => {
    const clientsCollection = collection(db, "clients");
    const querySnapshot = await getDocs(clientsCollection);
    const existAccounts = [];

    querySnapshot.forEach((snapshot) => {
      existAccounts.push(snapshot.data());
    });

    setExistAccountsArray(existAccounts);
  };

  //Get all reservations and filter them for client visit information
  const getAllReservations = async () => {
    const docRef = doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd");
    const docSnap = await getDoc(docRef);
    const sortedReservations = docSnap.data().reservations.sort((a, b) => {
      // Assuming date is in the format 'YYYY-MM-DD' and time is in 'HH:mm'
      const dateA = new Date(`${a.selectedDate}T${a.checkedTime}`);
      const dateB = new Date(`${b.selectedDate}T${b.checkedTime}`);

      return dateA - dateB; // Sort ascending
    });
    setAllReservations(sortedReservations);
  };

  useEffect(() => {
    if (allReservations) {
      const filteredReservation = allReservations
        .filter((reservation) => reservation.selectedDate === selectedDate)
        .sort((a, b) => {
          // Assuming date is in the format 'YYYY-MM-DD' and time is in 'HH:mm'
          const dateA = new Date(`${a.selectedDate}T${a.checkedTime}`);
          const dateB = new Date(`${b.selectedDate}T${b.checkedTime}`);

          return dateA - dateB; // Sort ascending
        });
      setFilteredUserReservations(filteredReservation);
    }
  }, [selectedDate]);

  useEffect(() => {
    setTimeout(getUsersData, 500);
  }, []);

  useEffect(() => {
    getAllReservations();
    getServices();
  }, [isActive, isChanged, isUpdated]);

  function addMinutesToTime(time, minutesToAdd) {
    // Split the time into hours and minutes
    const [hours, minutes] = time.split(":").map(Number);

    // Create a new Date object with today's date and the given time
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    // Add the minutes
    date.setMinutes(date.getMinutes() + minutesToAdd);

    // Extract the new hours and minutes
    const newHours = date.getHours().toString().padStart(2, "0");
    const newMinutes = date.getMinutes().toString().padStart(2, "0");

    // Return the new time in HH:mm format
    return `${newHours}:${newMinutes}`;
  }

  const filteredSelectDate = async () => {
    const array = [];
    const docRef = doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd");
    const docSnap = await getDoc(docRef);
    const filteredDateReservations = docSnap
      .data()
      .reservations.filter(
        (reservation) => reservation.selectedDate === selectedDate
      );
    filteredDateReservations.map((reservation) => {
      array.push({
        start: reservation.checkedTime,
        end: addMinutesToTime(reservation.checkedTime, reservation.time),
      });
    });
    setFilteredIntervals(array);
  };

  useEffect(() => {
    filteredSelectDate();
  }, [selectedDate]);

  function timeToMinutes(time) {
    var parts = time.split(":");
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }

  function isTimeGreaterThan(time1, time2) {
    var time1Minutes = timeToMinutes(time1);
    var time2Minutes = timeToMinutes(time2);
    return time1Minutes < time2Minutes;
  }

  function isTimeInInterval(time, interval) {
    const [timeHour, timeMinute] = time.split(":").map(Number);
    const [startHour, startMinute] = interval.start.split(":").map(Number);
    const [endHour, endMinute] = interval.end.split(":").map(Number);

    const timeInMinutes = timeHour * 60 + timeMinute;
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    // Checks if the time is within the interval (excluding the end time)
    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  }

  function findNextGreaterTime(objectsArray, targetTime) {
    // Konwertuj docelową godzinę na liczby całkowite (minuty od północy)
    const [targetHour, targetMinute] = targetTime.split(":").map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;

    // Zmienna do przechowywania najbliższej większej godziny
    let closestGreaterTime = null;
    let closestGreaterTimeDifference = Infinity;

    // Przeszukaj tablicę obiektów
    for (let obj of objectsArray) {
      const [startHour, startMinute] = obj.start.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;

      // Sprawdź, czy startTotalMinutes jest większe niż targetTotalMinutes
      if (startTotalMinutes > targetTotalMinutes) {
        // Oblicz różnicę w minutach
        const differenceInMinutes = startTotalMinutes - targetTotalMinutes;

        // Aktualizuj najbliższą większą godzinę, jeśli znaleziono bliższą
        if (differenceInMinutes < closestGreaterTimeDifference) {
          closestGreaterTimeDifference = differenceInMinutes;
          closestGreaterTime = obj;
        }
      }
    }

    return closestGreaterTime;
  }

  //Generating time slots in a carousel
  useEffect(() => {
    function generateTimeSlots(start, end, interval) {
      const index = currentDate.toISOString().indexOf("T");
      const arr = [];
      const timeToDeleteArr = [];
      for (let hour = start; hour <= end; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          let formattedHour = String(hour).padStart(2, "0");
          let formattedMinute = String(minute).padStart(2, "0");
          if (selectedDate === currentDate.toISOString().slice(0, index)) {
            let isInIntervalButNotEnd = false;
            for (let interval of filteredIntervals) {
              if (
                isTimeInInterval(
                  `${formattedHour}:${formattedMinute}`,
                  interval
                )
              ) {
                isInIntervalButNotEnd = true;
                break;
              }
            }

            if (
              isTimeGreaterThan(
                `${currentHour}:${currentMinutes}`,
                `${formattedHour}:${formattedMinute}`
              )
            ) {
              if (!isInIntervalButNotEnd) {
                arr.push({
                  key: Math.round(Math.random() * 100),
                  time: `${formattedHour}:${formattedMinute}`,
                });
              } else {
                timeToDeleteArr.push({
                  key: Math.round(Math.random() * 100),
                  time: `${formattedHour}:${formattedMinute}`,
                });
              }
            }
          } else {
            let isInIntervalButNotEnd = false;
            for (let interval of filteredIntervals) {
              if (
                isTimeInInterval(
                  `${formattedHour}:${formattedMinute}`,
                  interval
                )
              ) {
                isInIntervalButNotEnd = true;
                break;
              }
            }
            if (!isInIntervalButNotEnd) {
              arr.push({
                key: Math.round(Math.random() * 100),
                time: `${formattedHour}:${formattedMinute}`,
              });
            } else {
              timeToDeleteArr.push({
                key: Math.round(Math.random() * 100),
                time: `${formattedHour}:${formattedMinute}`,
              });
            }
          }
        }
      }
      setTimeSlots(arr);
    }

    generateTimeSlots(11, 17, 15);
  }, [selectedDate, filteredIntervals]);

  const active = (e) => {
    const fcday = document.querySelectorAll(".fc-day");
    fcday.forEach((day) => day.classList.remove("active"));
    e.dayEl.classList.add("active");
  };

  //Adding a class to the selected time
  useEffect(() => {
    const boxes = document.querySelectorAll(".time-box");
    if (boxes)
      boxes.forEach((box) => {
        if (box.innerHTML === checkedTime) {
          box.classList.add("box-ring");
        } else {
          box.classList.remove("box-ring");
        }
      });
  }, [checkedTime]);

  const Booking = async () => {
    const uniqueId = uuidv4();
    const closingTime = addMinutesToTime(checkedTime, time);
    const closestGreaterObject = findNextGreaterTime(
      filteredIntervals,
      checkedTime
    );
    if (closestGreaterObject && closingTime > closestGreaterObject.start) {
      errorTimeToast();
    } else {
      if (phone.current.value !== "") {
        const filteredAccount = existAccountsArray.filter(
          (account) => account.phone === phone.current.value
        );
        if (selected.name && price && time && selectedDate && checkedTime) {
          await updateDoc(doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd"), {
            reservations: arrayUnion({
              uid: filteredAccount[0].uid,
              selected: selected.name,
              price: price,
              time: time,
              selectedDate: selectedDate,
              checkedTime: checkedTime,
              name: filteredAccount[0].name,
              surname: filteredAccount[0].surname,
              phone: filteredAccount[0].phone,
              id: uniqueId,
            }),
          }).then(() => {
            successToast();
          });
        } else {
          errorToast();
        }
      } else {
        errorPhoneToast();
      }
    }
  };

  const CancelBooking = async (id) => {
    const updateArray = allReservations;
    const deleteIndex = updateArray.findIndex(
      (reservation) => reservation.id === id
    );
    updateArray.splice(deleteIndex, 1);

    await updateDoc(doc(db, "reservations", "rO6yptJcpbmJnwWDAcHd"), {
      reservations: updateArray,
    }).then(() => setIsChanged(!isChanged));
  };

  const loadingSlots = () => {
    const days = document.querySelectorAll(".fc-daygrid-day-top");
    const arr = [];
    days.forEach((dayy) => {
      const displayStyle = window
        .getComputedStyle(dayy)
        .getPropertyValue("visibility"); // Pobierz wartość stylu 'display'
      if (displayStyle === "visible") {
        const dateString = dayy.children[0].getAttribute("aria-label");
        const [month, day, year] = dateString.split(" "); // Rozdziel ciąg na części po spacji

        // Pobierz indeks miesiąca na podstawie jego nazwy
        const monthIndex = {
          January: 0,
          February: 1,
          March: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11,
        }[month];

        const selectedDate = new Date(year, monthIndex, parseInt(day, 10) + 1); // Utwórz obiekt daty
        const index2 = selectedDate.toISOString().indexOf("T");
        const dateISOString2 = selectedDate.toISOString().slice(0, index2);
        if (allReservations) {
          allReservations.filter((reservation) => {
            const index = new Date(reservation.selectedDate)
              .toISOString()
              .indexOf("T");
            const dateISOString = new Date(reservation.selectedDate)
              .toISOString()
              .slice(0, index);
            if (dateISOString === dateISOString2) {
              const existingObjIndex = arr.findIndex(
                (obj) => obj.date === dateISOString
              );

              if (existingObjIndex !== -1) {
                // Jeśli istnieje obiekt dla danej daty, dodaj do niego wartość alertu
                arr.forEach((a) => {
                  if (a.date === dateISOString2) {
                    a.value += 1;
                  }
                });
              } else {
                // Jeśli nie istnieje obiekt dla danej daty, utwórz nowy obiekt i dodaj do tablicy `arr`
                arr.push({ date: dateISOString2, value: 1 });
              }
            }
          });
        }

        if (arr.length > 0) {
          arr.forEach((a) => {
            if (a.date === dateISOString2) {
              dayy.parentElement.children[2].style.fontSize = "14px";
              dayy.parentElement.children[2].style.textAlign = "center";
              dayy.parentElement.children[2].style.color = "#000";
              dayy.parentElement.children[2].innerHTML = `Visits: ${a.value}`;
            }
          });
        }
      }
    });
  };

  useEffect(() => {
    loadingSlots();
  }, [allReservations]);

  const getServiceLastID = async () => {
    const services = await getDoc(doc(db, "services", "h5GWbuVAl34xOtpJIHLo"));
    return services.data().services.length + 1;
  };

  const AddService = async () => {
    const id = await getServiceLastID();
    if (
      servicename.current.value &&
      serviceduration.current.value &&
      serviceprice.current.value
    ) {
      await updateDoc(doc(db, "services", "h5GWbuVAl34xOtpJIHLo"), {
        services: arrayUnion({
          id: id,
          name: servicename.current.value,
          price: serviceduration.current.value,
          time: serviceprice.current.value,
        }),
      }).then(() => {
        successServiceToast();
        setIsUpdated(!isUpdated);
      });
    } else {
      errorServiceToast();
    }
  };

  const deleteService = async(id) => {
    if(services.lenght === 1){
      errorServiceLength();
    }else{
      const updatedServices = services;
      const index = updatedServices.findIndex((service) => service.id === id);
      updatedServices.splice(index, 1);
  
      await updateDoc(doc(db, "services", "h5GWbuVAl34xOtpJIHLo"), {
        services: updatedServices,
      }).then(() => {
        setIsUpdated(!isUpdated);
        deleteServiceToast();
      })
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex min-h-full flex-1 flex-row justify-center px-6 py-8 lg:px-8">
        <div className="form-size">
          <Button className="logout-button p-2 text-base" onClick={logout}>
            Logout
          </Button>
          <ButtonGroup className="pt-16" id="btn-group2">
            <Button
              className={
                isActive === "Booking"
                  ? "active-adm-button"
                  : "normal-adm-button"
              }
              onClick={() => setIsActive("Booking")}
            >
              Booking
            </Button>
            <Button
              className={
                isActive === "Services"
                  ? "active-adm-button"
                  : "normal-adm-button"
              }
              onClick={() => setIsActive("Services")}
            >
              Services
            </Button>
            <Button
              className={
                isActive === "Appointments"
                  ? "active-adm-button"
                  : "normal-adm-button"
              }
              onClick={() => setIsActive("Appointments")}
            >
              Appointments
            </Button>
          </ButtonGroup>
          {isActive === "Booking" && (
            <>
              <Listbox value={selected} onChange={(e) => changeSelect(e)}>
                {({ open }) => (
                  <>
                    <div className="pt-2">
                      <Label
                        htmlFor="phone"
                        className="block text-lg font-medium leading-6 text-gray-900"
                      >
                        Phone number
                      </Label>
                      <div className="mt-2">
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="phone"
                          ref={phone}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <Label className="block text-lg font-medium leading-6 text-gray-900 pt-2">
                      Services
                    </Label>
                    <div className="relative mt-2">
                      <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-brown sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">
                            {selected.name}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-10 ml-3 flex items-center pr-2">
                            ${selected.price}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </ListboxButton>

                      <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {services.map((person) => (
                          <ListboxOption
                            key={person.id}
                            className={({ active }) =>
                              classNames(
                                active ? "bg-brown text-white" : "",
                                !active ? "text-gray-900" : "",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={person}
                          >
                            {({ selected }) => (
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {person.name}
                                </span>
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "pointer-events-none absolute inset-y-0 right-10 ml-3 flex items-center pr-2"
                                  )}
                                >
                                  ${person.price}
                                </span>
                                {selected && (
                                  <span className="text-white absolute inset-y-0 right-0 flex items-center pr-4">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </>
                )}
              </Listbox>

              {timeSlots.length > 0 && (
                <Carousel className="carousel pt-2" responsive={responsive}>
                  {timeSlots.map((slot) => (
                    <div
                      className="time-box"
                      key={slot.key}
                      onClick={(e) => setCheckedTime(e.target.innerHTML)}
                    >
                      {slot.time}
                    </div>
                  ))}
                </Carousel>
              )}

              <div className="flex flex-row justify-between pr-2 pt-2">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Selected date:
                </p>
                <p>
                  {checkedTime} {selectedDate}
                </p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-6">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Service duration:
                </p>
                <p>{time} min</p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-6">
                <p className="block text-lg font-medium leading-6 text-gray-900">
                  Total:
                </p>
                <p>${price}</p>
              </div>

              <div className="flex flex-row justify-between pr-2 pt-8">
                <Button
                  onClick={Booking}
                  className="booking-button p-2 text-base"
                >
                  Booking
                </Button>
              </div>
            </>
          )}

          {isActive === "Services" && (
            <>
              <div
                style={{ border: "2px solid #e5e7eb", borderRadius: "4px" }}
                className="container w-full overflow-y-scroll mt-3 height-2"
              >
                <Card className="w-full overflow-scroll">
                  <table className="w-full table-auto text-left">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Service name
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Duration
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Price
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(({ name, price, time, id }, index) => (
                        <tr key={name} className="even:bg-blue-gray-50/50">
                          <td className="p-4">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {name}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {time} min
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              ${price}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography
                              onClick={() => deleteService(id)}
                              as="a"
                              href="#"
                              variant="small"
                              color="blue-gray"
                              className="font-medium"
                            >
                              Delete
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
              <div className="pt-2">
                <label
                  htmlFor="servicename"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Service name
                </label>
                <div className="mt-2">
                  <input
                    id="servicename"
                    name="servicename"
                    type="text"
                    ref={servicename}
                    autoComplete="servicename"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label
                  htmlFor="serviceduration"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Duration (provide in minutes)
                </label>
                <div className="mt-2">
                  <input
                    id="serviceduration"
                    name="serviceduration"
                    type="text"
                    ref={serviceduration}
                    autoComplete="serviceduration"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label
                  htmlFor="serviceprice"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Price
                </label>
                <div className="mt-2">
                  <input
                    id="serviceprice"
                    name="serviceprice"
                    type="text"
                    ref={serviceprice}
                    autoComplete="serviceprice"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between pr-2 pt-8">
                <Button
                  onClick={AddService}
                  className="booking-button p-2 text-base"
                >
                  Add service
                </Button>
              </div>
            </>
          )}

          {isActive === "Appointments" && (
            <>
              <div className="flex w-full justify-end">
                <p
                  onClick={() => {
                    setFilteredUserReservations();
                    active();
                  }}
                  className="pt-2 text-lg hover:underline hover:cursor-pointer"
                >
                  Show all visits
                </p>
              </div>
              <div
                style={{ border: "2px solid #e5e7eb", borderRadius: "4px" }}
                className="container w-full overflow-y-scroll mt-3 height pb-4"
              >
                {filteredUserReservations
                  ? filteredUserReservations &&
                    filteredUserReservations.map((reservation) => (
                      <div key={reservation.id} className="pl-4 pt-2 text-lg">
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexFlow: "row nowrap",
                          }}
                        >
                          <p style={{ marginBottom: 0, margin: "5px" }}>
                            {reservation.checkedTime} {reservation.selectedDate}
                          </p>
                          {openStates[`ID${reservation.id}`] ? (
                            <ExpandLess
                              onClick={() =>
                                handleToggle(`ID${reservation.id}`)
                              }
                            />
                          ) : (
                            <ExpandMore
                              onClick={() =>
                                handleToggle(`ID${reservation.id}`)
                              }
                            />
                          )}
                        </div>
                        {/* Adjust as per your requirements */}
                        <Collapse
                          in={openStates[`ID${reservation.id}`]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Name: </strong>
                                  {reservation.name}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Surname: </strong>
                                  {reservation.surname}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Phone: </strong>
                                  {reservation.phone}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Service: </strong>
                                  {reservation.selected}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Duration: </strong>
                                  {reservation.time} min
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Price: </strong>${reservation.price}
                                </span>
                              }
                            />
                            <Button
                              className="cancel-button"
                              onClick={() => CancelBooking(reservation.id)}
                            >
                              Cancel
                            </Button>
                          </List>
                        </Collapse>
                      </div>
                    ))
                  : allReservations &&
                    allReservations.map((reservation) => (
                      <div key={reservation.id} className="pl-4 pt-2 text-lg">
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexFlow: "row nowrap",
                          }}
                        >
                          <p style={{ marginBottom: 0, margin: "5px" }}>
                            {reservation.checkedTime} {reservation.selectedDate}
                          </p>
                          {openStates[`ID${reservation.id}`] ? (
                            <ExpandLess
                              onClick={() =>
                                handleToggle(`ID${reservation.id}`)
                              }
                            />
                          ) : (
                            <ExpandMore
                              onClick={() =>
                                handleToggle(`ID${reservation.id}`)
                              }
                            />
                          )}
                        </div>
                        {/* Adjust as per your requirements */}
                        <Collapse
                          in={openStates[`ID${reservation.id}`]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Name: </strong>
                                  {reservation.name}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Surname: </strong>
                                  {reservation.surname}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Phone: </strong>
                                  {reservation.phone}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Service: </strong>
                                  {reservation.selected}
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Duration: </strong>
                                  {reservation.time} min
                                </span>
                              }
                            />
                            <ListItemText
                              style={{ marginLeft: "1rem" }}
                              primary={
                                <span className="listItem">
                                  <strong>Price: </strong>${reservation.price}
                                </span>
                              }
                            />
                            <Button
                              className="cancel-button"
                              onClick={() => CancelBooking(reservation.id)}
                            >
                              Cancel
                            </Button>
                          </List>
                        </Collapse>
                      </div>
                    ))}
              </div>
            </>
          )}
        </div>

        <div className="planer-size">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            height="83vh"
            aspectRatio={0}
            initialView="dayGridMonth"
            selectable={true}
            select={handleSelect}
            firstDay={1}
            dateClick={(e) => active(e)}
            validRange={{
              start: currentDate.toISOString().split("T")[0],
              end: threeMonthsLater.toISOString().split("T")[0],
            }}
          />
        </div>
      </div>
    </>
  );
}
