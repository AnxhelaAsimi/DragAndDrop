enum ProjectStatus { Active, Finished}

// Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ){};
}

//Listener
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: T[] = [];

  addListener(listenrfn: T) {
    this.listeners.push(listenrfn);
  }
}

//Project State Management
class ProjectState extends State<Listener<Project>> {  
  private projects: any[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addProject(title: string, desc: string, nOfPeople: number) {
    const newProject = new Project(Math.random().toString(),title, desc, nOfPeople, ProjectStatus.Active);

    this.projects.push(newProject);
    for (const listenrfn of this.listeners) {
      listenrfn(this.projects.slice());
    }
  } 
}

//singleton
const projectState = ProjectState.getInstance();

//validation logic
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null) {
    if (typeof validatableInput.value === "string")
      isValid =
        isValid &&
        validatableInput.value.trim().length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null) {
    if (typeof validatableInput.value === "string")
      isValid =
        isValid &&
        validatableInput.value.trim().length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

//Component
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(templateId: string, hostElementId: string,  insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    
    this.hostElement = document.getElementById(hostElementId) as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if(newElementId)
      this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    if(insertAtBeginning)
      this.hostElement.insertAdjacentElement("afterbegin", this.element);
    else
      this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>{
  private project: Project;

  constructor(hostId: string,  project: Project){    
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
      
  }

  getNumberOfPeople(): string{
    if(this.project.people>2)
      return 'Number of people assigned: '+ this.project.people.toString();
    else
      return 'Only : '+ this.project.people.toString()+ ' person assigned';
  }

  renderContent(): void {
      this.element.querySelector('h2')!.textContent = this.project.title;
      this.element.querySelector('h3')!.textContent = this.getNumberOfPeople();
      this.element.querySelector('p')!.textContent = this.project.description;
  }
} 

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure(){
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(x => {
        if(this.type == 'active')
          return x.status === ProjectStatus.Active
        return x.status === ProjectStatus.Finished
      });
      this.renderProjects();
    });
  }
}

//ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputELement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputELement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const desc = this.descriptionInputELement.value;
    const people = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descValidatable: Validatable = {
      value: desc,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    
    if (
      !validate(titleValidatable) ||
      !validate(descValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      this.clearInputs();
      return;
    } else {
      this.clearInputs();
      return [enteredTitle, desc, +people];
    }
  }

  renderContent(): void {
      
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputELement.value = "";
    this.peopleInputElement.value = "";
  }

  // @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      console.log(title, desc, people);
    }
  }

  
}

const projInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
